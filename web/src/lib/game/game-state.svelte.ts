import type { GameState } from '$lib/types';

const initialGameState = {
	players: {},
	name: ''
};

const initialLocalState = {
	isHost: false
};

export const gameState: GameState = $state(initialGameState);
export const localState = $state(initialLocalState);

export const resetGameState = () => {
	gameState.name = initialGameState.name;
	gameState.players = {};
	localState.isHost = initialLocalState.isHost;
};
