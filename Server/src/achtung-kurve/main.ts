import { Socket } from 'socket.io';
import { Player } from './player';
import { logger } from '../logger';
import { constants } from './constants';
import { segmentIntersection } from './segment-intersection';

export class AchtungKurve implements LunnNet.NetworkGame {
    private readonly TIME_LIMIT = 10 * 60 * 1000;
    private readonly FIXED_TIME_STEP = 25;

    static MIN_PLAYERS = 2;
    static MAX_PLAYERS = constants.playerColors.length;
    readonly GAME_NAME = 'AchtungKurve';

    private intervalReference: NodeJS.Timer | undefined;
    private timeLimitReference: NodeJS.Timer | undefined;
    private tick = 0;
    private paused = false;
    private stopped = false;
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
        playerSockets.forEach(this.listenToEvents);
    }

    public initGame() {
        this.players.forEach((p, index) => {
            p.setStart(1, { x: 50 + 50 * index, y: 50 });
        });

        const gameFound: LunnNet.AchtungKurve.GameFound = {
            gameSize: constants.gameSize,
            players: this.players.map(p => p.toNewNetworkPlayer()),
            options: { player: { diameter: constants.playerDiameter, speed: Player.speed } }
        };
        this.emitToPlayers('GameFound', gameFound);

        this.intervalReference = setInterval(this.heartbeat, this.FIXED_TIME_STEP);

        this.setTimeLimit();
    }

    stopGame = (forced?: boolean) => {
        if (this.stopped) {
            return;
        }

        this.stopped = true;

        logger.info(
            `${this.GAME_NAME} - stopping game with players: ${this.players
                .map(p => p.socket.id)
                .join(' : ')}.${forced === true ? ' forced' : ''}`
        );

        if (this.intervalReference) {
            clearInterval(this.intervalReference);
        }

        if (this.timeLimitReference) {
            clearTimeout(this.timeLimitReference);
        }

        this.players.forEach(p => {
            if (p.socket.connected) {
                p.socket.disconnect(true);
            }
        });
    };

    private setTimeLimit() {
        this.timeLimitReference = setTimeout(() => {
            this.stopGame(true);
        }, this.TIME_LIMIT);
    }

    private heartbeat = () => {
        if (this.paused) {
            return;
        }

        this.tick++;

        const alivePlayers = this.players.filter(p => p.isAlive);

        alivePlayers.forEach(p => p.onUpdate(this.FIXED_TIME_STEP));
        this.checkCollisions();

        const serverTick: LunnNet.AchtungKurve.ServerTick = {
            tick: this.tick,
            players: alivePlayers.map(p => p.toUpdatePlayer())
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

    private listenToEvents = (socket: Socket) => {
        socket.on('UpdateFromClient', (data: LunnNet.AchtungKurve.UpdateFromClient) => {
            this.handleOnPlayerUpdate(socket.id, data);
        });
        socket.on('disconnect', this.stopGame);
    };

    private handleOnPlayerUpdate = (id: string, data: LunnNet.AchtungKurve.UpdateFromClient) => {
        if (this.stopped) {
            return;
        }

        const player = this.players.find(p => p.socket.id === id);
        if (!player) {
            logger.info(
                `${this.GAME_NAME} - handleOnPlayerUpdate - got info about player not in game.`
            );
            return;
        }

        player.onClientUpdate(data);

        // winston.info(`handleOnPlayerUpdate: ${player.socket.id} : ${data.velocityHorizontal}`);
    };

    private mapSocketToPlayer = (socket: Socket, index: number) => {
        return new Player(constants.playerColors[index], socket);
    };

    private checkCollisions() {
        this.players.filter(p => p.isAlive).forEach(p => {
            const { offset1, offset2 } = p.currentPositionLine;
            if (
                this.isOutsideOfGame(offset1) ||
                this.isOutsideOfGame(offset2) ||
                this.checkIntersects(p)
            ) {
                p.kill();
            }
        });
    }

    private isOutsideOfGame(line: LunnNet.Utils.Line) {
        return (
            line.x1 <= 0 ||
            line.x2 <= 0 ||
            line.x1 >= constants.gameSize.width ||
            line.x2 >= constants.gameSize.width ||
            line.y1 <= 0 ||
            line.y2 <= 0 ||
            line.y1 >= constants.gameSize.height ||
            line.y2 >= constants.gameSize.height
        );
    }

    private checkIntersects(player: Player) {
        const { offset1, offset2 } = player.currentPositionLine;
        return this.players.some(p => this.checkPlayerCollision(offset1, offset2, p, p === player));
    }

    private checkPlayerCollision(
        line1: LunnNet.Utils.Line,
        line2: LunnNet.Utils.Line,
        player: Player,
        isSelf: boolean
    ) {
        const offsetLines1 = player.getOffsetLines1();
        const offsetLines2 = player.getOffsetLines2();
        return (
            this.checkLines(line1, offsetLines1, isSelf) ||
            this.checkLines(line1, offsetLines2, isSelf) ||
            this.checkLines(line2, offsetLines1, isSelf) ||
            this.checkLines(line2, offsetLines2, isSelf)
        );
    }

    private checkLines(
        line: LunnNet.Utils.Line,
        offsetLines: LunnNet.Utils.Line[],
        isSelf: boolean
    ) {
        if (offsetLines.length < 2) {
            return false;
        }

        for (let i = isSelf ? 2 : 0; i < offsetLines.length; i++) {
            if (
                segmentIntersection(
                    line.x1,
                    line.y1,
                    line.x2,
                    line.y2,
                    offsetLines[i].x1,
                    offsetLines[i].y1,
                    offsetLines[i].x2,
                    offsetLines[i].y2
                )
            ) {
                logger.info(
                    `intersects: ${JSON.stringify(line)} ${JSON.stringify(offsetLines[i])}}`
                );

                return true;
            }
        }
        return false;
    }
}
