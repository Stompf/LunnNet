import { MultiDictionary } from 'typescript-collections';
import { logger } from './logger';
import { AirHockeyGame } from './games/air-hockey/main';
import { Socket } from 'socket.io';
import { AchtungKurveGame } from './games/achtung-kurve/main';
import { LunnNet } from './typings';

export class MatchMaking {
    private currentQueue: MultiDictionary<LunnNet.Game, Socket>;

    constructor() {
        this.currentQueue = new MultiDictionary<LunnNet.Game, Socket>();
    }

    addToQueue(socket: Socket, game: LunnNet.Game) {
        this.removeFromQueue(socket);
        this.currentQueue.setValue(game, socket);
        this.handleQueueChange(game);
    }

    removeFromQueue(socket: Socket) {
        this.currentQueue.keys().forEach(game => {
            if (this.currentQueue.remove(game, socket)) {
                logger.info('Removed player: ' + socket.id + ' from game: ' + game);
            }
        });
    }

    handleQueueChange(game: LunnNet.Game) {
        const array = this.currentQueue.getValue(game);

        switch (game) {
            case 'AirHockey':
                while (array.length >= AirHockeyGame.MIN_PLAYERS) {
                    const playerOne = array.shift() as Socket;
                    const playerTwo = array.shift() as Socket;

                    this.currentQueue.remove(game, playerOne);
                    this.currentQueue.remove(game, playerTwo);

                    const airHockey = new AirHockeyGame(playerOne, playerTwo);
                    airHockey.initGame();
                }
                break;
            case 'AchtungKurve':
                while (array.length >= AchtungKurveGame.MIN_PLAYERS) {
                    const playerOne = array.shift() as Socket;
                    const playerTwo = array.shift() as Socket;

                    this.currentQueue.remove(game, playerOne);
                    this.currentQueue.remove(game, playerTwo);

                    const achtungKurve = new AchtungKurveGame([playerOne, playerTwo]);
                    achtungKurve.initGame();
                }
                break;
            default:
                logger.error(`MatchMaking - tried to queue for game: ${game}`);
                break;
        }
    }
}
