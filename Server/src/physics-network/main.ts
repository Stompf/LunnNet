import { Player } from './player';
import * as winston from 'winston';

export class PhysicsNetwork {

    private player1: Player;
    private player2: Player;

    constructor(player1Socket: SocketIO.Socket, player2Socket: SocketIO.Socket) {
        this.player1 = new Player(player1Socket);
        this.player2 = new Player(player2Socket);
    }

    sendStartGame() {
        winston.info(`PhysicsNetwork, starting game with players: ${this.player1.socket.id} + ' : ' + ${this.player2.socket.id}`);
        this.player1.socket.emit('GameFound', {} as LunnNet.PhysicsNetwork.GameFound);
        this.player2.socket.emit('GameFound', {} as LunnNet.PhysicsNetwork.GameFound);
    }
}