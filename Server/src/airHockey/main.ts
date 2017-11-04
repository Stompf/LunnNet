import { Player } from './player';
import { Ball } from './ball';
import * as p2 from 'p2';

export class AirHockey {

    private playerOne: Player;
    private playerTwo: Player;
    private ball: Ball;

    private world: p2.World;
    private canvas = {
        width: 1400,
        height: 600
    };

    constructor(playerOneSocket: SocketIO.Socket, playerTwoSocket: SocketIO.Socket) {
        this.world = new p2.World({
            gravity: [0, 0]
        });

        this.playerOne = new Player(this.world, playerOneSocket);
        this.playerTwo = new Player(this.world, playerTwoSocket);

        this.ball = new Ball(this.world);

        this.initSockets(this.playerOne);
        this.initSockets(this.playerTwo);
    }

    sendStartGame() {
        console.log('AirHockey, starting game with players: ' + this.playerOne.id + ' : ' + this.playerTwo.id);
        this.playerOne.socket.emit('GameFound', {} as LunnNet.AirHockey.GameFound);
        this.playerTwo.socket.emit('GameFound', {} as LunnNet.AirHockey.GameFound);
    }

    private resetWorld() {
        this.world.clear();
    }

    private initSockets(player: Player) {
        player.socket.on('ClientReady', (_data: LunnNet.AirHockey.ClientReady) => {
            console.log('AirHockey - player is ready: ' + player.id);
            player.isReady = true;

            if (this.playerOne.isReady && this.playerTwo.isReady) {
                console.log('AirHockey - both players ready! Starting game!');
                this.startNewGame();
            }
        });
    }

    private startNewGame() {
        this.resetWorld();
        this.setStartPositions();
    }

    private setStartPositions() {

    }

}
