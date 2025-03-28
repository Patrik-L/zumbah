// @ts-nocheck
function defineProperties(target, descriptions) {
	/* eslint-disable-next-line guard-for-in */
	for (const property in descriptions) {
		Object.defineProperty(target, property, {
			configurable: true,
			value: descriptions[property]
		});
	}
}

const privates = new WeakMap();

// @ts-ignore
export const EventTargetMixin = (superclass, ...eventNames) =>
	class extends superclass {
		// @ts-ignore
		constructor(...args) {
			// @ts-ignore
			super(args);
			const eventTarget = document.createDocumentFragment();
			privates.set(this, eventTarget);
		}

		// @ts-ignore
		addEventListener(type, ...args) {
			const eventTarget = privates.get(this);
			return eventTarget.addEventListener(type, ...args);
		}

		// @ts-ignore
		removeEventListener(...args) {
			const eventTarget = privates.get(this);
			// @ts-ignore
			return eventTarget.removeEventListener(...args);
		}

		// @ts-ignore
		dispatchEvent(event) {
			defineProperties(event, { currentTarget: this });
			if (!event.target) {
				defineProperties(event, { target: this });
			}

			const eventTarget = privates.get(this);
			const retValue = eventTarget.dispatchEvent(event);

			if (retValue && this.parentNode) {
				this.parentNode.dispatchEvent(event);
			}

			defineProperties(event, { currentTarget: null, target: null });

			return retValue;
		}
	};

export class EventTarget extends EventTargetMixin(Object) {}

const __abort__ = Symbol('__abort__');

export class AbortSignal extends EventTarget {
	constructor() {
		super();

		this[__abort__] = {
			aborted: false
		};

		defineOnEventListener(this, 'abort');
		Object.defineProperty(this, 'aborted', {
			get: () => this[__abort__].aborted
		});
	}

	// @ts-ignore
	dispatchEvent(event) {
		if (event.type === 'abort') {
			this[__abort__].aborted = true;

			const methodName = `on${event.type}`;
			if (typeof this[methodName] == 'function') {
				this[methodName](event);
			}
		}
		super.dispatchEvent(event);
	}

	toString() {
		return '[object AbortSignal]';
	}
}

export class AbortController {
	constructor() {
		const signal = new AbortSignal();
		Object.defineProperty(this, 'signal', {
			get: () => signal
		});
	}

	abort() {
		let abort = new Event('abort');
		// @ts-ignore
		this.signal.dispatchEvent(abort);
	}

	toString() {
		return '[object AbortController]';
	}
}

// @ts-ignore
function defineOnEventListener(target, name) {
	Object.defineProperty(target, `on${name}`, {
		enumerable: true,
		configurable: false,
		writable: true,
		value: null
	});
}

// @ts-ignore
export function defineReadonlyProperties(target, slot, descriptions) {
	const propertyBag = target[slot];
	/* eslint-disable-next-line guard-for-in */
	for (const property in descriptions) {
		propertyBag[property] = descriptions[property];
		Object.defineProperty(target, property, {
			get: () => propertyBag[property]
		});
	}
}

export class SensorErrorEvent extends Event {
	// @ts-ignore
	constructor(type, errorEventInitDict) {
		super(type, errorEventInitDict);

		if (!errorEventInitDict || !(errorEventInitDict.error instanceof DOMException)) {
			throw TypeError(
				"Failed to construct 'SensorErrorEvent':" + "2nd argument much contain 'error' property"
			);
		}

		Object.defineProperty(this, 'error', {
			configurable: false,
			writable: false,
			value: errorEventInitDict.error
		});
	}
}

const SensorState = {
	IDLE: 1,
	ACTIVATING: 2,
	ACTIVE: 3
};

export const __sensor__ = Symbol('__sensor__');
const slot = __sensor__;

export const notifyError = Symbol('Sensor.notifyError');
export const notifyActivatedState = Symbol('Sensor.notifyActivatedState');

export const activateCallback = Symbol('Sensor.activateCallback');
export const deactivateCallback = Symbol('Sensor.deactivateCallback');

export class Sensor extends EventTarget {
	[activateCallback]() {}
	[deactivateCallback]() {}

	// @ts-ignore
	[notifyError](message, name) {
		let error = new SensorErrorEvent('error', {
			error: new DOMException(message, name)
		});
		this.dispatchEvent(error);
		this.stop();
	}

	[notifyActivatedState]() {
		let activate = new Event('activate');
		// @ts-ignore
		this[slot].activated = true;
		this.dispatchEvent(activate);
		// @ts-ignore
		this[slot].state = SensorState.ACTIVE;
	}

	// @ts-ignore
	constructor(options) {
		super();

		this[__sensor__] = {
			// Internal slots
			state: SensorState.IDLE,
			frequency: null,

			// Property backing
			activated: false,
			hasReading: false,
			timestamp: null
		};

		defineOnEventListener(this, 'reading');
		defineOnEventListener(this, 'activate');
		defineOnEventListener(this, 'error');

		Object.defineProperty(this, 'activated', {
			// @ts-ignore
			get: () => this[slot].activated
		});
		Object.defineProperty(this, 'hasReading', {
			// @ts-ignore
			get: () => this[slot].hasReading
		});
		Object.defineProperty(this, 'timestamp', {
			// @ts-ignore
			get: () => this[slot].timestamp
		});

		if (window && window.parent != window.top) {
			throw new DOMException('Only instantiable in a top-level browsing context', 'SecurityError');
		}

		if (options && typeof options.frequency == 'number') {
			if (options.frequency > 60) {
				this.frequency = options.frequency;
			}
		}
	}

	// @ts-ignore
	dispatchEvent(event) {
		switch (event.type) {
			case 'reading':
			case 'error':
			case 'activate': {
				const methodName = `on${event.type}`;
				if (typeof this[methodName] == 'function') {
					this[methodName](event);
				}
				super.dispatchEvent(event);
				break;
			}
			default:
				super.dispatchEvent(event);
		}
	}

	start() {
		// @ts-ignore
		if (
			this[slot].state === SensorState.ACTIVATING ||
			// @ts-ignore
			this[slot].state === SensorState.ACTIVE
		) {
			return;
		}
		// @ts-ignore
		this[slot].state = SensorState.ACTIVATING;
		this[activateCallback]();
	}

	stop() {
		// @ts-ignore
		if (this[slot].state === SensorState.IDLE) {
			return;
		}
		// @ts-ignore
		this[slot].activated = false;
		// @ts-ignore
		this[slot].hasReading = false;
		// @ts-ignore
		this[slot].timestamp = null;
		this[deactivateCallback]();

		// @ts-ignore
		this[slot].state = SensorState.IDLE;
	}
}
