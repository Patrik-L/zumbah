<script lang="ts">
	import { SignalTypes, type OrientationData, type Player } from '$lib/types';
	import { onSignal, socket } from '$lib/websocketConnection';
	import GameLobby from './game-lobby.svelte';
	import { gameState, localState } from './game-state.svelte';
	import { joinLobby } from './network/socket-requests';
	import DeviceView from './device-view.svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	const { lobbyId }: { lobbyId: string } = $props();
	let playerId = $state('');

	onSignal(SignalTypes.PlayerJoin, (player: Player) => {
		console.log('playerJoin');
		gameState.players[player.id] = player;
	});

	onSignal(SignalTypes.PlayerDisconnect, (id: string) => {
		delete gameState.players[id];
	});

	onSignal(SignalTypes.LobbyClose, () => {
		if (browser) {
			goto('/');
		}
	});

	onSignal(SignalTypes.SendOrientationData, (data: OrientationData) => {
		gameState.players[data.uid].gyro = data.quarternion;
	});

	const join = () => {
		const id = socket.id;
		if (!id) {
			console.error('Socket not connected/id not fetched!');
			return;
		}

		playerId = id;

		joinLobby({
			lobbyId,
			player: {
				name: 'patu',
				id,
				gyro: [0, 0, 0, 0]
			}
		});
	};

	if (!localState.isHost) {
		join();
	}
</script>

<p>{playerId}</p>
{#if localState.isHost}
	<GameLobby></GameLobby>
{:else}
	<DeviceView></DeviceView>
{/if}
