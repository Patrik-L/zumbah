import type { GameState, LocalState } from '$lib/types';

const initialGameState: GameState = {
	name: '',
	currentView: null,
	targetAngle: [0, 0, 0, 0],
	lobbyId: ''
};

const initialLocalState: LocalState = {
	isHost: false,
	connectedPlayers: {}
};

export const gameState: GameState = $state(initialGameState);
export const localState = $state(initialLocalState);

export const resetGameState = () => {
	gameState.name = initialGameState.name;
	gameState.currentView = null;
	localState.connectedPlayers = {};
	localState.isHost = initialLocalState.isHost;
};
