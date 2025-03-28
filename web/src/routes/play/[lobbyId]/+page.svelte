<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import GameRoot from '$lib/game/game-root.svelte';
	import { SignalTypes } from '$lib/types';
	import { emitSignal } from '$lib/websocketConnection';

	const lobbyCode = page.params.lobbyId;

	beforeNavigate(() => {
		emitSignal(SignalTypes.LeaveLobby);
	});
</script>

<GameRoot lobbyId={lobbyCode}></GameRoot>
