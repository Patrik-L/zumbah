<script lang="ts">
	import { Quaternion } from 'quaternion';
	import type { Player } from '../../types';
	const { player }: { player: Player } = $props();

	const euler = $derived(new Quaternion(...player.gyro).toEuler());
</script>

<div class="player-card">
	<h2>
		{player.name}
	</h2>
	<span>{(euler[0] * 57.2957795).toFixed(2)}</span>
	<span>{(euler[1] * 57.2957795).toFixed(2)}</span>
	<span>{(euler[2] * 57.2957795).toFixed(2)}</span>
</div>

<style>
	.player-card {
		width: 300px;
		height: 400px;
		background-color: rgb(109, 212, 246);
		color: black;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		border-radius: 2rem;
		margin: 2rem;
	}
</style>
