import { emitSignal, socket } from '$lib/websocketConnection';
import { SignalTypes, type GameState, type LobbyJoinParams } from '../../types';

export const joinLobby = (joinLobbyParams: LobbyJoinParams) => {
	emitSignal(SignalTypes.JoinLobby, joinLobbyParams);
};

export const updateGameState = (gamestate: GameState) => {
	emitSignal(SignalTypes.UpdateGameState, gamestate);
};

export const sendWinSignal = (uid: string) => {
	emitSignal(SignalTypes.SendWinSignal, uid);
};
