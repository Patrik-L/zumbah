<script lang="ts">
	import { goto } from '$app/navigation';
	import { resetGameState } from '$lib/game/game-state.svelte';
	const lobbyCode = 123;

	resetGameState();
</script>

<h1>Let's Zumbaaaaaah</h1>

<button onclick={() => goto(`/host/${lobbyCode}`)}> Create New Server! </button>

<button onclick={() => goto(`/play/${lobbyCode}`)}> Join!</button>
