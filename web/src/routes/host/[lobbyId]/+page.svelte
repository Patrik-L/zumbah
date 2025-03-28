<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { localState } from '$lib/game/game-state.svelte';
	import { SignalTypes } from '$lib/types';
	import { emitSignal, socket } from '$lib/websocketConnection';

	localState.isHost = true;
	emitSignal(SignalTypes.CreateLobby, page.params.lobbyId);
	goto(`/play/${page.params.lobbyId}`);
</script>
