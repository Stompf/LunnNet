import { Socket } from 'socket.io';
import { Player } from './player';
import { logger } from '../logger';

const PLAYER_COLORS = [
    '#FF4136',
    '#0074D9',
    '#7FDBFF',
    '#01FF70',
    '#FFDC00',
    '#B10DC9',
    '#F012BE',
    '#2ECC40'
];

export class AchtungKurve implements LunnNet.NetworkGame {
    static MIN_PLAYERS = 2;
    static MAX_PLAYERS = PLAYER_COLORS.length;
    readonly GAME_NAME = 'AchtungKurve';

    private players: Player[];

    constructor(playerSockets: Socket[]) {
        logger.info(`${this.GAME_NAME}: Starting new game`);

        if (playerSockets.length < AchtungKurve.MIN_PLAYERS) {
            throw new Error(`No players! Was: ${playerSockets.length}`);
        }
        if (playerSockets.length > AchtungKurve.MAX_PLAYERS) {
            throw new Error(
                `Too many players! Max players is: ${AchtungKurve.MAX_PLAYERS}. Was: ${
                playerSockets.length
                }`
            );
        }

        this.players = playerSockets.map(this.mapSocketToPlayer);
    }

    public initGame() {
        // TODO
    }

    private mapSocketToPlayer = (socket: Socket, index: number) => {
        return new Player(PLAYER_COLORS[index], socket);
    };
}
