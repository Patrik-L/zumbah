export interface Player {
	name: string;
	id: string;
	gyro: [a: number, b: number, c: number, d: number];
}

export interface GameState {
	players: { [id: string]: Player };
	name: string;
}

export interface PlayerCreateParams {
	name: string;
}

export interface LobbyJoinParams {
	lobbyId: string;
	player: Player;
}

export interface OrientationData {
	quarternion: [a: number, b: number, c: number, d: number];
	uid: string;
}

export enum SignalTypes {
	CreateLobby = 'createLobby',
	JoinLobby = 'joinLobby',
	PlayerJoin = 'playerJoin',
	PlayerDisconnect = 'playerDisconnect',
	LobbyClose = 'lobbyClose',
	LeaveLobby = 'leaveLobby',
	SendOrientationData = 'sendOrientationData'
}
