export class Player {

    id: string;
    socket: SocketIO.Socket;
    isReady: boolean;

    constructor(socket: SocketIO.Socket) {
        this.id = socket.id;
        this.socket = socket;
    }



}
