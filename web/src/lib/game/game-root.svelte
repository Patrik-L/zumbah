<script lang="ts">
	import { SignalTypes, View, type GameState, type OrientationData, type Player } from '$lib/types';
	import { onSignal, socket } from '$lib/websocketConnection';
	import GameLobby from './views/game-lobby.svelte';
	import { gameState, localState } from './game-state.svelte';
	import DeviceView from './device-view.svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import type { Component } from 'svelte';
	import InGame from './views/in-game.svelte';
	import { calculateCloseness } from './angles';

	import InteractionPrompt from './views/interaction-prompt.svelte';
	const { lobbyId }: { lobbyId: string } = $props();

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

	const views: { [key in View]: Component } = {
		[View.Lobby]: GameLobby,
		[View.InGame]: InGame
	};
</script>

{#if localState.isHost}
	{#if gameState.currentView != null}
		{@const SvelteComponent = views[gameState.currentView]}
		<SvelteComponent></SvelteComponent>
	{/if}
{:else if localState.hasInteracted}
	<DeviceView {lobbyId}></DeviceView>
{:else}
	<InteractionPrompt></InteractionPrompt>
{/if}
