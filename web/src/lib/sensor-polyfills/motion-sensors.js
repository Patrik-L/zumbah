// @ts-nocheck
import {
	Sensor,
	defineReadonlyProperties,
	__sensor__,
	notifyError,
	notifyActivatedState,
	activateCallback,
	deactivateCallback
} from './sensor.js';

const slot = __sensor__;
const handleEventCallback = Symbol('handleEvent');

let orientation;

// @ts-ignore
if (screen.orientation) {
	// @ts-ignore
	orientation = screen.orientation;
} else if (screen.msOrientation) {
	orientation = screen.msOrientation;
} else {
	orientation = {};
	Object.defineProperty(orientation, 'angle', {
		get: () => {
			return window.orientation || 0;
		}
	});
}

const rotationToRadian = (function () {
	// Returns Chrome version, or null if not Chrome.
	const match = navigator.userAgent.match(/.*Chrome\/([0-9]+)/);
	const chromeVersion = match ? parseInt(match[1], 10) : null;

	// DeviceMotion/Orientation API return deg/s (except Chrome,
	// but fixing in M66). Gyroscope needs rad/s.
	const returnsDegrees = chromeVersion === null || chromeVersion >= 66;
	const conversion = returnsDegrees ? Math.PI / 180 : 1.0;
	return function (value) {
		return value * conversion;
	};
})();

const DeviceOrientationMixin = (superclass, ...eventNames) =>
	class extends superclass {
		constructor(...args) {
			// @ts-ignore
			super(args);

			for (const eventName of eventNames) {
				if (`on${eventName}` in window) {
					this[slot].eventName = eventName;
					break;
				}
			}
		}

		[activateCallback]() {
			window.addEventListener(this[slot].eventName, this[handleEventCallback].bind(this), {
				capture: true
			});
		}

		[deactivateCallback]() {
			window.removeEventListener(this[slot].eventName, this[handleEventCallback].bind(this), {
				capture: true
			});
		}
	};

function toQuaternionFromEuler(alpha, beta, gamma) {
	const degToRad = Math.PI / 180;

	const x = (beta || 0) * degToRad;
	const y = (gamma || 0) * degToRad;
	const z = (alpha || 0) * degToRad;

	const cZ = Math.cos(z * 0.5);
	const sZ = Math.sin(z * 0.5);
	const cY = Math.cos(y * 0.5);
	const sY = Math.sin(y * 0.5);
	const cX = Math.cos(x * 0.5);
	const sX = Math.sin(x * 0.5);

	const qx = sX * cY * cZ - cX * sY * sZ;
	const qy = cX * sY * cZ + sX * cY * sZ;
	const qz = cX * cY * sZ + sX * sY * cZ;
	const qw = cX * cY * cZ - sX * sY * sZ;

	return [qx, qy, qz, qw];
}

function rotateQuaternionByAxisAngle(quat, axis, angle) {
	const sHalfAngle = Math.sin(angle / 2);
	const cHalfAngle = Math.cos(angle / 2);

	const transformQuat = [
		axis[0] * sHalfAngle,
		axis[1] * sHalfAngle,
		axis[2] * sHalfAngle,
		cHalfAngle
	];

	function multiplyQuaternion(a, b) {
		const qx = a[0] * b[3] + a[3] * b[0] + a[1] * b[2] - a[2] * b[1];
		const qy = a[1] * b[3] + a[3] * b[1] + a[2] * b[0] - a[0] * b[2];
		const qz = a[2] * b[3] + a[3] * b[2] + a[0] * b[1] - a[1] * b[0];
		const qw = a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2];

		return [qx, qy, qz, qw];
	}

	function normalizeQuaternion(quat) {
		const length = Math.sqrt(quat[0] ** 2 + quat[1] ** 2 + quat[2] ** 2 + quat[3] ** 2);
		if (length === 0) {
			return [0, 0, 0, 1];
		}

		return quat.map((v) => v / length);
	}

	return normalizeQuaternion(multiplyQuaternion(quat, transformQuat));
}

function toMat4FromQuat(mat, q) {
	const typed = mat instanceof Float32Array || mat instanceof Float64Array;

	if (typed && mat.length >= 16) {
		mat[0] = 1 - 2 * (q[1] ** 2 + q[2] ** 2);
		mat[1] = 2 * (q[0] * q[1] - q[2] * q[3]);
		mat[2] = 2 * (q[0] * q[2] + q[1] * q[3]);
		mat[3] = 0;

		mat[4] = 2 * (q[0] * q[1] + q[2] * q[3]);
		mat[5] = 1 - 2 * (q[0] ** 2 + q[2] ** 2);
		mat[6] = 2 * (q[1] * q[2] - q[0] * q[3]);
		mat[7] = 0;

		mat[8] = 2 * (q[0] * q[2] - q[1] * q[3]);
		mat[9] = 2 * (q[1] * q[2] + q[0] * q[3]);
		mat[10] = 1 - 2 * (q[0] ** 2 + q[1] ** 2);
		mat[11] = 0;

		mat[12] = 0;
		mat[13] = 0;
		mat[14] = 0;
		mat[15] = 1;
	}

	return mat;
}

function deviceToScreen(quaternion) {
	return !quaternion
		? null
		: rotateQuaternionByAxisAngle(quaternion, [0, 0, 1], (-orientation.angle * Math.PI) / 180);
}

// @ts-ignore
export const RelativeOrientationSensor =
	window.RelativeOrientationSensor ||
	class RelativeOrientationSensor extends DeviceOrientationMixin(Sensor, 'deviceorientation') {
		constructor(options = {}) {
			super(options);

			switch (options.referenceFrame || 'device') {
				case 'screen':
					Object.defineProperty(this, 'quaternion', {
						get: () => deviceToScreen(this[slot].quaternion)
					});
					break;
				default: // incl. case 'device'
					Object.defineProperty(this, 'quaternion', {
						get: () => this[slot].quaternion
					});
			}
		}

		[handleEventCallback](event) {
			// If there is no sensor we will get values equal to null.
			if (event.absolute || event.alpha === null) {
				// Spec: The implementation can still decide to provide
				// absolute orientation if relative is not available or
				// the resulting data is more accurate. In either case,
				// the absolute property must be set accordingly to reflect
				// the choice.
				this[notifyError]('Could not connect to a sensor', 'NotReadableError');
				return;
			}

			if (!this[slot].activated) {
				this[notifyActivatedState]();
			}

			this[slot].timestamp = performance.now();

			this[slot].quaternion = toQuaternionFromEuler(event.alpha, event.beta, event.gamma);

			this[slot].hasReading = true;
			this.dispatchEvent(new Event('reading'));
		}

		[deactivateCallback]() {
			super[deactivateCallback]();
			this[slot].quaternion = null;
		}

		populateMatrix(mat) {
			toMat4FromQuat(mat, this.quaternion);
		}
	};

// @ts-ignore
export const AbsoluteOrientationSensor =
	window.AbsoluteOrientationSensor ||
	class AbsoluteOrientationSensor extends DeviceOrientationMixin(
		Sensor,
		'deviceorientationabsolute',
		'deviceorientation'
	) {
		constructor(options = {}) {
			super(options);

			switch (options.referenceFrame || 'device') {
				case 'screen':
					Object.defineProperty(this, 'quaternion', {
						get: () => deviceToScreen(this[slot].quaternion)
					});
					break;
				default: // incl. case 'device'
					Object.defineProperty(this, 'quaternion', {
						get: () => this[slot].quaternion
					});
			}
		}

		[handleEventCallback](event) {
			// If absolute is set, or webkitCompassHeading exists,
			// absolute values should be available.
			const isAbsolute = event.absolute === true || 'webkitCompassHeading' in event;
			const hasValue = event.alpha !== null || event.webkitCompassHeading !== undefined;

			if (!isAbsolute || !hasValue) {
				// Spec: If an implementation can never provide absolute
				// orientation information, the event should be fired with
				// the alpha, beta and gamma attributes set to null.
				this[notifyError]('Could not connect to a sensor', 'NotReadableError');
				return;
			}

			if (!this[slot].activated) {
				this[notifyActivatedState]();
			}

			this[slot].hasReading = true;
			this[slot].timestamp = performance.now();

			const heading =
				event.webkitCompassHeading != null ? 360 - event.webkitCompassHeading : event.alpha;

			this[slot].quaternion = toQuaternionFromEuler(heading, event.beta, event.gamma);

			this.dispatchEvent(new Event('reading'));
		}

		[deactivateCallback]() {
			super[deactivateCallback]();
			this[slot].quaternion = null;
		}

		populateMatrix(mat) {
			toMat4FromQuat(mat, this.quaternion);
		}
	};

// @ts-ignore
export const Gyroscope =
	window.Gyroscope ||
	class Gyroscope extends DeviceOrientationMixin(Sensor, 'devicemotion') {
		constructor(options) {
			super(options);
			defineReadonlyProperties(this, slot, {
				x: null,
				y: null,
				z: null
			});
		}

		[handleEventCallback](event) {
			// If there is no sensor we will get values equal to null.
			if (event.rotationRate.alpha === null) {
				this[notifyError]('Could not connect to a sensor', 'NotReadableError');
				return;
			}

			if (!this[slot].activated) {
				this[notifyActivatedState]();
			}

			this[slot].timestamp = performance.now();

			this[slot].x = rotationToRadian(event.rotationRate.alpha);
			this[slot].y = rotationToRadian(event.rotationRate.beta);
			this[slot].z = rotationToRadian(event.rotationRate.gamma);

			this[slot].hasReading = true;
			this.dispatchEvent(new Event('reading'));
		}

		[deactivateCallback]() {
			super[deactivateCallback]();
			this[slot].x = null;
			this[slot].y = null;
			this[slot].z = null;
		}
	};

// @ts-ignore
export const Accelerometer =
	window.Accelerometer ||
	class Accelerometer extends DeviceOrientationMixin(Sensor, 'devicemotion') {
		constructor(options) {
			super(options);
			defineReadonlyProperties(this, slot, {
				x: null,
				y: null,
				z: null
			});
		}

		[handleEventCallback](event) {
			// If there is no sensor we will get values equal to null.
			if (event.accelerationIncludingGravity.x === null) {
				this[notifyError]('Could not connect to a sensor', 'NotReadableError');
				return;
			}

			if (!this[slot].activated) {
				this[notifyActivatedState]();
			}

			this[slot].timestamp = performance.now();

			this[slot].x = event.accelerationIncludingGravity.x;
			this[slot].y = event.accelerationIncludingGravity.y;
			this[slot].z = event.accelerationIncludingGravity.z;

			this[slot].hasReading = true;
			this.dispatchEvent(new Event('reading'));
		}

		[deactivateCallback]() {
			super[deactivateCallback]();
			this[slot].x = null;
			this[slot].y = null;
			this[slot].z = null;
		}
	};

// @ts-ignore
export const LinearAccelerationSensor =
	window.LinearAccelerationSensor ||
	class LinearAccelerationSensor extends DeviceOrientationMixin(Sensor, 'devicemotion') {
		constructor(options) {
			super(options);
			defineReadonlyProperties(this, slot, {
				x: null,
				y: null,
				z: null
			});
		}

		[handleEventCallback](event) {
			// If there is no sensor we will get values equal to null.
			if (event.acceleration.x === null) {
				this[notifyError]('Could not connect to a sensor', 'NotReadableError');
				return;
			}

			if (!this[slot].activated) {
				this[notifyActivatedState]();
			}

			this[slot].timestamp = performance.now();

			this[slot].x = event.acceleration.x;
			this[slot].y = event.acceleration.y;
			this[slot].z = event.acceleration.z;

			this[slot].hasReading = true;
			this.dispatchEvent(new Event('reading'));
		}

		[deactivateCallback]() {
			super[deactivateCallback]();
			this[slot].x = null;
			this[slot].y = null;
			this[slot].z = null;
		}
	};

// @ts-ignore
export const GravitySensor =
	window.GravitySensor ||
	class GravitySensor extends DeviceOrientationMixin(Sensor, 'devicemotion') {
		constructor(options) {
			super(options);
			defineReadonlyProperties(this, slot, {
				x: null,
				y: null,
				z: null
			});
		}

		[handleEventCallback](event) {
			// If there is no sensor we will get values equal to null.
			if (event.acceleration.x === null || event.accelerationIncludingGravity.x === null) {
				this[notifyError]('Could not connect to a sensor', 'NotReadableError');
				return;
			}

			if (!this[slot].activated) {
				this[notifyActivatedState]();
			}

			this[slot].timestamp = performance.now();

			this[slot].x = event.accelerationIncludingGravity.x - event.acceleration.x;
			this[slot].y = event.accelerationIncludingGravity.y - event.acceleration.y;
			this[slot].z = event.accelerationIncludingGravity.z - event.acceleration.z;

			this[slot].hasReading = true;
			this.dispatchEvent(new Event('reading'));
		}

		[deactivateCallback]() {
			super[deactivateCallback]();
			this[slot].x = null;
			this[slot].y = null;
			this[slot].z = null;
		}
	};
