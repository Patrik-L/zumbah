import ioClient from 'socket.io-client';
import type { SignalTypes } from './types';
const ENDPOINT = 'https://zumba-ws.patu.xyz';

const ioSocket = ioClient(ENDPOINT);

export const socket = ioSocket;

export const emitSignal = (signal: SignalTypes, ...args: any[]) => {
	return socket.emit(signal, ...args);
};

export const onSignal = (signal: SignalTypes, cb: (message: any) => void) => {
	return socket.on(signal, cb);
};
