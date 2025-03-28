import { emitSignal, socket } from '$lib/websocketConnection';
import { SignalTypes, type LobbyJoinParams, type PlayerCreateParams } from '../../types';

export const joinLobby = (joinLobbyParams: LobbyJoinParams) => {
	emitSignal(SignalTypes.JoinLobby, joinLobbyParams);
};
