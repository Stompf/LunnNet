export class Player {
    socket: SocketIO.Socket;

    constructor(socket: SocketIO.Socket) {
        this.socket = socket;
    }
}