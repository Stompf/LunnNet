export class AirHockey {

    private playerOne: SocketIO.Socket;
    private playerTwo: SocketIO.Socket;

    constructor(playerOne: SocketIO.Socket, playerTwo: SocketIO.Socket) {
        this.playerOne = playerOne;
        this.playerTwo = playerTwo;
    }

    startGame() {

    }

}
