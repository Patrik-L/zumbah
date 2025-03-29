<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { RelativeOrientationSensor } from '$lib/sensor-polyfills/motion-sensors';
	import { SignalTypes, type SimpleQuarternion } from '$lib/types';
	import { emitSignal, socket } from '$lib/websocketConnection';
	import { calculateCloseness, getClampedPercentage } from './angles';
	import { gameState } from './game-state.svelte';
	import rawClick from '$lib/assets/bump.ogg';
	const sensor = new RelativeOrientationSensor({ frequency: 30, referenceFrame: 'device' });

	let sensorData: SimpleQuarternion | undefined = $state([0, 0, 0, 0]);

	const onRead = () => {
		if (!sensor.quaternion) {
			return;
		}
		const data: SimpleQuarternion = sensor.quaternion;
		sensorData = data.map((val) => Number(val.toFixed(3))) as SimpleQuarternion;

		if (sensorData) {
			emitSignal(SignalTypes.SendOrientationData, {
				quarternion: sensorData,
				uid: socket.id
			});
		}
	};

	const bump = new Audio(rawClick);
	bump.volume = 0.2;
	bump.loop = false;

	// const tick = () => {
	// 	console.timeEnd('click');
	// 	console.time('click');

	// 	let nextTick = 1000;

	// 	if (sensorData) {
	// 		const closeness = getClampedPercentage(calculateCloseness(sensorData, gameState.targetAngle));

	// 		if (closeness > 80) {
	// 			console.log('play bump');
	// 			bump.play();
	// 		}

	// 		nextTick = (100 - closeness) * 5;
	// 	}

	// 	setTimeout(tick, nextTick);
	// };

	// tick();

	const interval = setInterval(() => {
		onRead();
	}, 25);

	sensor.addEventListener('error', (event: any) => {
		console.log(event);
		if (event.error.name === 'NotReadableError') {
			console.log('Sensor is not available.');
		}
	});

	sensor.start();

	beforeNavigate(() => {
		console.log('remove interval');
		clearInterval(interval);
	});
</script>

<h1>You're connected!</h1>
<code>{JSON.stringify(sensorData, undefined, 4)}</code>
<code style="white-space: pre;">
	{JSON.stringify(gameState, null, 4)}
</code>
