import { MultiDictionary } from 'typescript-collections';
import { AirHockey } from './air-hockey/main';
import * as winston from 'winston';

export class MatchMaking {

    private currentQueue: MultiDictionary<LunnNet.Game, SocketIO.Socket>;

    constructor() {
        this.currentQueue = new MultiDictionary<LunnNet.Game, SocketIO.Socket>();
    }

    addToQueue(socket: SocketIO.Socket, game: LunnNet.Game) {
        this.removeFromQueue(socket);
        this.currentQueue.setValue(game, socket);
        this.handleQueueChange(game);
    }

    removeFromQueue(socket: SocketIO.Socket) {
        this.currentQueue.keys().forEach(game => {
            if (this.currentQueue.remove(game, socket)) {
                winston.log('info', 'Removed player: ' + socket.id + ' from game: ' + game);
            }
        });
    }

    handleQueueChange(game: LunnNet.Game) {
        switch (game) {
            case LunnNet.Game.AirHockey:
                const array = this.currentQueue.getValue(game);
                while (array.length >= 2) {
                    const playerOne = array.shift() as SocketIO.Socket;
                    const playerTwo = array.shift() as SocketIO.Socket;

                    this.currentQueue.remove(game, playerOne);
                    this.currentQueue.remove(game, playerTwo);

                    const airHockey = new AirHockey(playerOne, playerTwo);
                    airHockey.sendStartGame();
                }
                break;
            default:
                break;
        }
    }
}
