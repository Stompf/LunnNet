import { MultiDictionary } from 'typescript-collections';
//import * as AirHockey from './airHockey/main';

export class Matchmaking {

    private currentQueue: MultiDictionary<LunnNet.Game, SocketIO.Socket>;

    constructor() {
        this.currentQueue = new MultiDictionary<LunnNet.Game, SocketIO.Socket>();
    }

    addToQueue(socket: SocketIO.Socket, game: LunnNet.Game) {
        this.currentQueue.setValue(game, socket);
        this.handleQueueChange(game);
    }

    removeFromQueue(socket: SocketIO.Socket, game: LunnNet.Game) {
        this.currentQueue.remove(game, socket);
    }

    handleQueueChange(game: LunnNet.Game) {
        const array = this.currentQueue.getValue(game);
        while (array.length >= 2) {
            const playerOne = array.pop() as SocketIO.Socket;
            const playerTwo = array.pop() as SocketIO.Socket;

            this.startGame(playerOne, playerTwo);
        }
    }

    private startGame(_playerOne: SocketIO.Socket, _playerTwo: SocketIO.Socket) {

    }
}
