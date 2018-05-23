import { Socket } from 'socket.io';
import { Player } from './player';
import { logger } from '../logger';
import { PLAYER_COLORS } from './constants';

export class AchtungKurve implements LunnNet.NetworkGame {
    static MIN_PLAYERS = 2;
    static MAX_PLAYERS = PLAYER_COLORS.length;
    readonly GAME_NAME = 'AchtungKurve';
    private readonly FIXED_TIME_STEP = 1 / 60;

    private tick = 0;
    private paused = false;

    private intervalReference: NodeJS.Timer | undefined;

    players: Player[];

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
        this.players.forEach((p, index) => {
            p.setStart(1, { x: 50 + 10 * index, y: 50 });
        });

        this.intervalReference = setInterval(this.heartbeat, this.FIXED_TIME_STEP);
    }

    stopGame() {
        if (this.intervalReference) {
            clearInterval(this.intervalReference);
        }
    }

    private heartbeat = () => {
        this.tick++;

        if (!this.paused) {
            this.players.forEach(p => p.onUpdate(this.FIXED_TIME_STEP));
        }

        const serverTick: LunnNet.AchtungKurve.ServerTick = {
            tick: this.tick,
            players: this.players.map(p => p.toUpdatePlayer())
        };

        // winston.info(`heartbeat: ${serverTick.players[0].velocity}`);

        this.emitToPlayers('ServerTick', serverTick);
    };

    private emitToPlayers(event: string, data?: any) {
        this.players.forEach(p => {
            if (p.socket.connected) {
                p.socket.emit(event, data);
            }
        });
    }

    private mapSocketToPlayer = (socket: Socket, index: number) => {
        return new Player(PLAYER_COLORS[index], socket);
    };
}
