<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { gameState, localState } from '$lib/game/game-state.svelte';
	import { SignalTypes, View } from '$lib/types';
	import { emitSignal } from '$lib/websocketConnection';

	localState.isHost = true;
	gameState.currentView = View.InGame;
	gameState.lobbyId = page.params.lobbyId;
	emitSignal(SignalTypes.CreateLobby, page.params.lobbyId);
	goto(`/play/${page.params.lobbyId}`);
</script>
