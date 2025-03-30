<script lang="ts">
	import { beforeNavigate, onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import AudioPlayer from '$lib/audio-player.svelte';
	import Qr from '$lib/qr.svelte';
	import { onDestroy } from 'svelte';
	import { getClampedPercentage } from '../angles';
	import { gameState, localState } from '../game-state.svelte';
	import OrientationVizualizer from '../orientation-vizualizer.svelte';
	import PlayerCard from '../users/player-card.svelte';
	import { sendWinSignal, updateGameState } from '../network/socket-requests';
	import rawNextRoundSound from '$lib/assets/next-round.wav';
	import rawAudio from '$lib/assets/game-music.mp3';

	const rerollTargetAngle = () => {
		gameState.targetAngle = [
			Math.random() * 2 - 1,
			Math.random() * 2 - 1,
			Math.random() * 2 - 1,
			Math.random() * 2 - 1
		];
	};

	const nextRoundSound = new Audio(rawNextRoundSound);
	nextRoundSound.volume = 0.3;
	nextRoundSound.loop = false;
	const playerWin = (uid: string) => {
		localState.connectedPlayers[uid].wins += 1;
		nextRoundSound.play();
		rerollTargetAngle();
		sendWinSignal(uid);
	};

	const updateLoop = setInterval(() => {
		updateGameState(gameState);

		for (const player of Object.values(localState.connectedPlayers)) {
			const closeness = getClampedPercentage(player.closeness);

			if (closeness > 90) {
				if (closeness >= 100) {
					playerWin(player.id);
				}
			}
		}
	}, 250);

	rerollTargetAngle();

	onDestroy(() => {
		clearInterval(updateLoop);
	});
	beforeNavigate(() => {
		clearInterval(updateLoop);
		song.pause();
	});

	const song = new Audio(rawAudio);
	song.volume = 0.2;
	song.loop = true;
	song.play();
</script>

<div class="container">
	<h2 style="font-size: 3em; margin-bottom: 0; color: #F28482">Let's Zumbaaaaaah!</h2>
	<div class="game">
		<div class="left">
			<h2>Copy this!</h2>
			<div class="target-view">
				<OrientationVizualizer orientationData={gameState.targetAngle}></OrientationVizualizer>
			</div>
			<div class="qr-code-container">
				<Qr value={page.url.toString()} width={200}></Qr>
			</div>
		</div>
		<div class="right">
			<h2>Player view</h2>
			<div class="grid">
				{#each Object.values(localState.connectedPlayers) as player}
					<div class="card-container">
						<PlayerCard {player}></PlayerCard>
					</div>
				{/each}
			</div>
		</div>
		<!-- <code style="white-space: pre;">
			{JSON.stringify(gameState, null, 4)}
		</code> -->
	</div>
</div>

<style>
	.container {
		background-color: #f7ede2;
		position: fixed;
		top: 0%;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		flex-direction: column;
		color: #333333;
	}

	.game {
		display: flex;
		width: calc(100% - 4rem);
		flex: 1;
		margin: 2rem;
		border-radius: 2rem;
		overflow: hidden;
		border: 5px solid #333333;

		animation: beat forwards 0.6s infinite;
		animation-timing-function: ease-in-out;
		animation-play-state: paused;

		.left {
			background-color: #f6bd60;
			flex: 2;
			display: flex;
			flex-direction: column;
			align-items: center;
			min-width: 40rem;
		}

		.right {
			display: flex;
			flex-direction: column;
			align-items: center;
			background-color: #84a589;
			flex: 5;
		}
	}

	.grid {
		padding: 2rem;
		box-sizing: border-box;
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		width: 100%;
	}

	.card-container {
		width: 100%;
		height: 400px;
	}

	.qr-code-container {
		padding: 1rem;
		background-color: #f7ede2;
		border: 4px solid #333333;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 2rem;
		margin: 1rem;
	}

	.target-view {
		flex: 1;
		height: 500px;
		width: 100%;
	}

	@keyframes beat {
		0% {
			transform: scale3d(1, 1, 1);
		}
		25% {
			transform: scale3d(1, 1, 1);
		}
		50% {
			transform: scale3d(1, 1.005, 1.005);
		}

		75% {
			transform: scale3d(1.005, 0.995, 1.005);
		}
		100% {
			transform: scale3d(1, 1, 1);
		}
	}
</style>
