<script lang="ts">
	import { SignalTypes, View, type GameState, type OrientationData, type Player } from '$lib/types';
	import { onSignal, socket } from '$lib/websocketConnection';
	import GameLobby from './views/game-lobby.svelte';
	import { gameState, localState } from './game-state.svelte';
	import { joinLobby } from './network/socket-requests';
	import DeviceView from './device-view.svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import type { Component } from 'svelte';
	import InGame from './views/in-game.svelte';
	import { calculateCloseness } from './angles';
	import rawWinSound from '$lib/assets/win.ogg';

	const { lobbyId }: { lobbyId: string } = $props();
	let playerId = $state('');

	onSignal(SignalTypes.PlayerJoin, (player: Player) => {
		console.log('playerJoin', player);
		localState.connectedPlayers[player.id] = player;
	});

	onSignal(SignalTypes.PlayerDisconnect, (id: string) => {
		delete localState.connectedPlayers[id];
	});

	onSignal(SignalTypes.LobbyClose, () => {
		if (browser) {
			goto('/');
		}
	});

	onSignal(SignalTypes.SendOrientationData, (data: OrientationData) => {
		localState.connectedPlayers[data.uid].gyro = data.quarternion;
		localState.connectedPlayers[data.uid].closeness = calculateCloseness(
			gameState.targetAngle,
			data.quarternion
		);
	});

	onSignal(SignalTypes.UpdateGameState, (updatedState: GameState) => {
		Object.entries(updatedState).map(([key, val]) => {
			gameState[key as keyof GameState] = val;
		});
	});

	const winSound = new Audio(rawWinSound);
	winSound.volume = 0.2;
	winSound.loop = false;
	onSignal(SignalTypes.SendWinSignal, () => {
		console.log('WIN VIBR>A');
		winSound.play();
		navigator.vibrate(200);
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
				gyro: [Math.random(), Math.random(), Math.random(), Math.random()],
				closeness: 1,
				wins: 0
			}
		});
	};

	if (!localState.isHost) {
		join();
	}

	const views: { [key in View]: Component } = {
		[View.Lobby]: GameLobby,
		[View.InGame]: InGame
	};
</script>

<p>{playerId}</p>
{#if localState.isHost}
	{#if gameState.currentView != null}
		{@const SvelteComponent = views[gameState.currentView]}
		<SvelteComponent></SvelteComponent>
	{/if}
{:else}
	<DeviceView></DeviceView>
{/if}
