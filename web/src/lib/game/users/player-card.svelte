<script lang="ts">
	import { Quaternion } from 'quaternion';
	import type { Player } from '../../types';
	import randomColor from 'randomcolor';
	import OrientationVizualizer from '../orientation-vizualizer.svelte';
	import { getClampedPercentage } from '../angles';
	const { player }: { player: Player } = $props();

	const playerColor = randomColor({ luminosity: 'light' });
</script>

<div class="player-card" style:background-color={playerColor}>
	<div class="orient-flex">
		<OrientationVizualizer orientationData={player.gyro}></OrientationVizualizer>
	</div>

	<h3 style="margin: 0; margin-bottom: 1rem">
		Closeness: {getClampedPercentage(player.closeness).toFixed(0)}% | Wins: {player.wins}
	</h3>
</div>

<style>
	.player-card {
		width: 100%;
		height: 100%;
		display: flex;
		color: black;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		border-radius: 2rem;
	}

	.orient-flex {
		flex: 1;
		width: 100%;
		height: 0;
	}
</style>
