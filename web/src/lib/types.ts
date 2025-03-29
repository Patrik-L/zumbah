export interface Player {
	name: string;
	id: string;
	gyro: [a: number, b: number, c: number, d: number];
	closeness: number;
	wins: number;
}

export enum View {
	Lobby = 'lobby',
	InGame = 'inGame'
}
export interface GameState {
	name: string;
	currentView: View | null;
	targetAngle: SimpleQuarternion;
	lobbyId: string;
}

export interface LocalState {
	isHost: boolean;
	connectedPlayers: { [id: string]: Player };
}

export interface PlayerCreateParams {
	name: string;
}

export interface LobbyJoinParams {
	lobbyId: string;
	player: Player;
}

export type SimpleQuarternion = [a: number, b: number, c: number, d: number];

export interface OrientationData {
	quarternion: SimpleQuarternion;
	uid: string;
}

export enum SignalTypes {
	CreateLobby = 'createLobby',
	JoinLobby = 'joinLobby',
	PlayerJoin = 'playerJoin',
	PlayerDisconnect = 'playerDisconnect',
	LobbyClose = 'lobbyClose',
	LeaveLobby = 'leaveLobby',
	SendOrientationData = 'sendOrientationData',
	UpdateGameState = 'updateGameState',
	SendWinSignal = 'sendWinSignal'
}
