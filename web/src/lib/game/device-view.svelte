<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { AbsoluteOrientationSensor } from '$lib/sensor-polyfills/motion-sensors';
	import { SignalTypes, type OrientationData } from '$lib/types';
	import { emitSignal, socket } from '$lib/websocketConnection';
	const sensor = new AbsoluteOrientationSensor({ frequency: 30, referenceFrame: 'device' });

	let sensorData: OrientationData['quarternion'] | undefined = $state();

	const onRead = () => {
		if (!sensor.quaternion) {
			return;
		}
		const data: OrientationData['quarternion'] = sensor.quaternion;
		sensorData = data.map((val) => Number(val.toFixed(3))) as OrientationData['quarternion'];

		if (sensorData) {
			emitSignal(SignalTypes.SendOrientationData, {
				quarternion: sensorData,
				uid: socket.id
			});
		}
	};

	setInterval(() => {
		onRead();
	}, 100);

	sensor.addEventListener('error', (event: any) => {
		console.log(event);
		if (event.error.name === 'NotReadableError') {
			console.log('Sensor is not available.');
		}
	});

	sensor.start();

	beforeNavigate(() => {
		console.log('remove');
		sensor.removeEventListener('reading', onRead);
	});
</script>

<h1>You're connected!</h1>
<code>{JSON.stringify(sensorData, undefined, 4)}</code>
