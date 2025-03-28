<script lang="ts">
	import { page } from '$app/state';
	import Qr from '$lib/qr.svelte';
	import type { GameState } from '../types';
	import PlayerCard from './users/player-card.svelte';
	import { gameState } from './game-state.svelte';
</script>

<div class="player-cards">
	{#each Object.values(gameState.players) as player}
		<PlayerCard {player}></PlayerCard>
	{/each}
</div>
<div class="qr-code-container">
	<Qr value={page.url.toString()} width={200}></Qr>
</div>

<style>
	.player-cards {
		display: flex;
		flex-wrap: wrap;
	}

	.qr-code-container {
		padding: 1rem;
		background-color: rgb(255, 255, 255);
		border: 4px solid black;
		position: fixed;
		right: 0;
		top: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 2rem;
		margin: 1rem;
	}
</style>
