import { MultiDictionary } from 'typescript-collections';
import { AirHockey } from './airHockey/main';

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
                console.log('Removed player: ' + socket.id + ' from game: ' + game);
            }
        });
    }

    handleQueueChange(game: LunnNet.Game) {
        switch (game) {
            case LunnNet.Game.AirHockey:
                const array = this.currentQueue.getValue(game);
                while (array.length >= 2) {
                    const playerOne = array.pop() as SocketIO.Socket;
                    const playerTwo = array.pop() as SocketIO.Socket;

                    const airHockey = new AirHockey(playerOne, playerTwo);
                    airHockey.startGame();
                }
                break;
            default:
                break;
        }
    }
}
