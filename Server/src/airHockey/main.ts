import { Player } from './player';

export class AirHockey {

    private playerOne: Player;
    private playerTwo: Player;

    constructor(playerOneSocket: SocketIO.Socket, playerTwoSocket: SocketIO.Socket) {
        this.playerOne = new Player(playerOneSocket);
        this.playerTwo = new Player(playerTwoSocket);

        this.initSockets(this.playerOne);
        this.initSockets(this.playerTwo);
    }

    sendStartGame() {
        console.log('AirHockey, starting game with players: ' + this.playerOne.id + ' ; ' + this.playerTwo.id);
        this.playerOne.socket.emit('GameFound', {} as LunnNet.AirHockey.GameFound);
        this.playerTwo.socket.emit('GameFound', {} as LunnNet.AirHockey.GameFound);
    }

    private initSockets(player: Player) {
        player.socket.on('ClientReady', (_data: LunnNet.AirHockey.ClientReady) => {
            console.log('AirHockey - player is ready: ' + player.id);
            player.isReady = true;

            if (this.playerOne.isReady && this.playerTwo.isReady) {
                console.log('AirHockey - both players ready starting game!');
                this.startGame();
            }
        });
    }

    private startGame() {
        
    }

}
