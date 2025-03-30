<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { RelativeOrientationSensor } from '$lib/sensor-polyfills/motion-sensors';
	import { SignalTypes, type GameState, type SimpleQuarternion } from '$lib/types';
	import { emitSignal, onSignal, socket } from '$lib/websocketConnection';
	import { calculateCloseness, getClampedPercentage } from './angles';
	import { gameState, localState } from './game-state.svelte';
	import { joinLobby } from './network/socket-requests';
	import rawWinSound from '$lib/assets/win.ogg';
	const sensor = new RelativeOrientationSensor({ frequency: 30, referenceFrame: 'device' });

	let sensorData: SimpleQuarternion | undefined = $state();
	const { lobbyId }: { lobbyId: string } = $props();

	let closeness = $derived(
		getClampedPercentage(calculateCloseness(sensorData, gameState.targetAngle))
	);

	onSignal(SignalTypes.UpdateGameState, (updatedState: GameState) => {
		Object.entries(updatedState).map(([key, val]) => {
			gameState[key as keyof GameState] = val;
		});
	});

	const winSound = new Audio(rawWinSound);
	winSound.volume = 0.2;
	winSound.loop = false;
	onSignal(SignalTypes.SendWinSignal, () => {
		winSound.play();
	});

	const join = () => {
		const id = socket.id;
		if (!id) {
			console.error('Socket not connected/id not fetched!');
			return;
		}

		joinLobby({
			lobbyId,
			player: {
				name: 'patu',
				id,
				gyro: [Math.random(), Math.random(), Math.random(), Math.random()],
				closeness: 1,
				wins: 0
			}
		});
	};

	if (!localState.isHost) {
		join();
	}

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

<div class="container" style:background-color={`#2ce661${Math.round(closeness * 2).toString(16)}`}>
	<h1>You're connected!</h1>
	<h1>{closeness.toFixed(0)}%</h1>
</div>

<!-- <code>{JSON.stringify(sensorData, undefined, 4)}</code>
<code style="white-space: pre;">
	{JSON.stringify(gameState, null, 4)}
</code> -->

<style>
	.container {
		position: fixed;
		display: flex;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
