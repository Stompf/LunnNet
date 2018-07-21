import { Socket } from 'socket.io';
import { Player } from './player';
import { logger } from '../../logger';
import { constants } from './constants';
import { segmentIntersection } from './segment-intersection';
import { LunnNet, AchtungKurve } from '../../typings';

export class AchtungKurveGame implements LunnNet.NetworkGame {
    private readonly TIME_LIMIT = 10 * 60 * 1000;
    private readonly FIXED_TIME_STEP = 25;
    private readonly SPAWN_OFFSET = 100;
    private readonly START_TIMEOUT = 1000;
    private readonly ROUND_TIMEOUT = 3000;

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

        if (playerSockets.length < AchtungKurveGame.MIN_PLAYERS) {
            throw new Error(`No players! Was: ${playerSockets.length}`);
        }
        if (playerSockets.length > AchtungKurveGame.MAX_PLAYERS) {
            throw new Error(
                `Too many players! Max players is: ${AchtungKurveGame.MAX_PLAYERS}. Was: ${
                    playerSockets.length
                }`
            );
        }

        this.players = playerSockets.map(this.mapSocketToPlayer);
        playerSockets.forEach(this.listenToEvents);
    }

    public initGame() {
        const startPositions = this.getRandomStartPositions(this.players.length);
        this.players.forEach((p, index) => {
            p.setStart(startPositions[index].movement, startPositions[index].position);
        });

        const gameFound: AchtungKurve.GameFound = {
            gameSize: constants.gameSize,
            players: this.players.map(p => p.toNewNetworkPlayer()),
            options: { player: { diameter: constants.playerDiameter, speed: Player.speed } }
        };
        this.emitToPlayers('GameFound', gameFound);

        this.paused = true;
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
                .join(' : ')}.${forced ? ' forced' : ''}`
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

        const serverTick: AchtungKurve.ServerTick = {
            tick: this.tick,
            players: alivePlayers.map(p => p.toUpdatePlayer())
        };

        if (!this.paused) {
            this.emitToPlayers('ServerTick', serverTick);
        }
    };

    private emitToPlayers(event: string, data?: any) {
        this.players.forEach(p => {
            if (p.socket.connected) {
                p.socket.emit(event, data);
            }
        });
    }

    private listenToEvents = (socket: Socket) => {
        socket.on('PlayerReady', (_data: AchtungKurve.PlayerReady) => {
            this.handleOnPlayerReady(socket.id);
        });
        socket.on('UpdateFromClient', (data: AchtungKurve.UpdateFromClient) => {
            this.handleOnPlayerUpdate(socket.id, data);
        });
        socket.on('disconnect', this.stopGame);
    };

    private handleOnPlayerReady = (id: string) => {
        const player = this.players.find(p => p.Id === id);
        if (!player) {
            logger.info(
                `handleOnPlayerReady - Tried to ready player that does not exist in game. Id: ${id}`
            );
            return;
        }

        player.ready = true;
        if (this.players.every(p => p.ready) && this.paused) {
            this.startRound(this.START_TIMEOUT);
        }
    };

    private startRound(timeoutMs: number) {
        setTimeout(() => {
            this.paused = false;
            this.tick = 0;
        }, timeoutMs);
    }

    private handleOnPlayerUpdate = (id: string, data: AchtungKurve.UpdateFromClient) => {
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
                this.checkGameOver();
            }
        });
    }

    private checkGameOver() {
        const alivePlayers = this.players.filter(p => p.isAlive);
        if (alivePlayers.length === 1 || alivePlayers.length === 0) {
            this.sendNewRound(alivePlayers.length ? alivePlayers[0] : undefined);
        }
    }

    private sendNewRound(winner?: Player) {
        this.paused = true;
        const startPositions = this.getRandomStartPositions(this.players.length);
        this.players.forEach((p, index) => {
            p.setStart(startPositions[index].movement, startPositions[index].position);
        });

        const roundOver: AchtungKurve.RoundOver = {
            color: winner ? winner.color : undefined,
            roundTimeout: this.ROUND_TIMEOUT,
            winnerId: winner ? winner.Id : undefined,
            players: this.players.map(p => p.toNewRoundPlayer())
        };
        this.emitToPlayers('RoundOver', roundOver);

        this.startRound(this.ROUND_TIMEOUT);
    }

    private isOutsideOfGame(line: LunnNet.Utils.Line | null) {
        return (
            line != null &&
            (line.x1 <= 0 ||
                line.x2 <= 0 ||
                line.x1 >= constants.gameSize.width ||
                line.x2 >= constants.gameSize.width ||
                line.y1 <= 0 ||
                line.y2 <= 0 ||
                line.y1 >= constants.gameSize.height ||
                line.y2 >= constants.gameSize.height)
        );
    }

    private checkIntersects(player: Player) {
        const { offset1, offset2 } = player.currentPositionLine;
        return this.players.some(p => this.checkPlayerCollision(offset1, offset2, p, p === player));
    }

    private checkPlayerCollision(
        line1: LunnNet.Utils.Line | null,
        line2: LunnNet.Utils.Line | null,
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
        line: LunnNet.Utils.Line | null,
        offsetLines: LunnNet.Utils.Line[],
        isSelf: boolean
    ) {
        if (offsetLines.length < 4 || line == null) {
            return false;
        }

        for (let i = isSelf ? 4 : 0; i < offsetLines.length; i++) {
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
                return true;
            }
        }
        return false;
    }

    private getRandomStartPositions(playerCount: number) {
        const startPositions: AchtungKurve.StartPosition[] = [];
        for (let i = 0; i < playerCount; i++) {
            const x = this.getRandomArbitrary(
                this.SPAWN_OFFSET,
                constants.gameSize.width - this.SPAWN_OFFSET
            );
            const y = this.getRandomArbitrary(
                this.SPAWN_OFFSET,
                constants.gameSize.height - this.SPAWN_OFFSET
            );
            startPositions.push({
                movement: this.getRandomMovement(),
                position: { x, y }
            });
        }
        return startPositions;
    }

    private getRandomMovement() {
        return Math.random() * 2 * Math.PI;
    }

    private getRandomArbitrary(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }
}
