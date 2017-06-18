import { MultiDictionary } from 'typescript-collections';

class Matchmaking {

    private currentQueue: MultiDictionary<LunnNet.Game, SocketIO.Socket>;

    constructor() {
        this.currentQueue = new MultiDictionary<LunnNet.Game, SocketIO.Socket>();
    }

    addToQueue(socket: SocketIO.Socket, game: LunnNet.Game) {
        this.currentQueue.setValue(game, socket);
    }

    removeFromQueue(socket: SocketIO.Socket, game: LunnNet.Game) {
        this.currentQueue.remove(game, socket);
    }
}
