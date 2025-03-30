<script lang="ts">
	import { localState, resetGameState } from '$lib/game/game-state.svelte';
	const lobbyCode = 123;

	resetGameState();

	localState.hasInteracted = true;
</script>

<div class="container">
	<h1>Let's Zumbaaaaaah</h1>

	<a href="/host/{lobbyCode}"> Create New Server! </a>

	<a href="/play/{lobbyCode}"> Join!</a>
</div>

<style>
	a {
		background-color: #f6bd60;
		padding: 2rem;
		font-size: 1.5em;
		border: none;
		border-radius: 20px;
		margin: 0.5rem;
		color: black;
		text-decoration: none;
		text-align: center;
		font-family: 'Knewave', system-ui;
		width: 15em;
	}

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
