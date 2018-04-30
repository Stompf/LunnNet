import { Socket } from 'socket.io';

export class Player {
    constructor(private color: string, private socket: Socket) {}
}
