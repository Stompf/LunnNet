import { Socket } from 'socket.io';
import { logger } from '../logger';

export class Player {
    static speed = 0.1;

    socket: Socket;

    private get Id() {
        return this.socket.id;
    }

    private color: number;
    private movement: number = 1;
    private positions: WebKitPoint[] = [];
    private _isAlive = true;

    get isAlive() {
        return this._isAlive;
    }

    get currentPosition() {
        return this.positions[0];
    }

    get currentPositionLine() {
        if (this.positions.length < 2) {
            return { posA1: this.positions[0], posA2: this.positions[0] };
        }

        return { posA1: this.positions[0], posA2: this.positions[1] };
    }

    constructor(color: number, socket: Socket) {
        this.socket = socket;
        this.color = color;
    }

    setStart(movement: number, position: WebKitPoint) {
        this.movement = movement;
        this.positions = [position];
    }

    onUpdate(deltaTime: number) {
        if (!this.isAlive) {
            return;
        }

        const oldPosition = this.positions[0];
        const velocityX = Math.cos(this.movement) * Player.speed;
        const velocityY = Math.sin(this.movement) * Player.speed;
        const newPosition = {
            x: Number((oldPosition.x + deltaTime * velocityX).toFixed(2)),
            y: Number((oldPosition.y + deltaTime * velocityY).toFixed(2))
        };

        if (newPosition.x !== oldPosition.x || newPosition.y !== oldPosition.y) {
            this.positions.unshift(newPosition);
        }
    }

    onClientUpdate(data: LunnNet.AchtungKurve.UpdateFromClient) {
        if (!this.isAlive) {
            return;
        }
        this.movement = data.movement;
    }

    toNewNetworkPlayer(): LunnNet.AchtungKurve.NewNetworkPlayer {
        return {
            color: this.color,
            id: this.Id,
            startMovement: this.movement,
            startPosition: this.positions[0]
        };
    }

    toUpdatePlayer(): LunnNet.AchtungKurve.UpdatePlayer {
        return {
            id: this.Id,
            positions: this.positions.slice(0, 1)
        };
    }

    getPositions() {
        return this.positions;
    }

    kill() {
        this._isAlive = false;
        logger.info(`player killed`);
    }
}
