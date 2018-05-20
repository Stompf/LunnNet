import { Socket } from 'socket.io';

export class Player {
    socket: Socket;

    private get Id() {
        return this.socket.id;
    }

    private color: number;

    constructor(color: number, socket: Socket) {
        this.socket = socket;
        this.color = color;
    }

    onUpdate() {}

    toNewNetworkPlayer(): LunnNet.AchtungKurve.NewNetworkPlayer {
        return {
            color: this.color,
            id: this.Id
        };
    }

    toUpdatePlayer(): LunnNet.AchtungKurve.UpdatePlayer {
        return {
            id: this.Id,
            positions: []
        };
    }
}
