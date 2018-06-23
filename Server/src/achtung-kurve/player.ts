import { Socket } from 'socket.io';
import { logger } from '../logger';
import { constants } from './constants';

export class Player {
    static speed = 0.1;

    socket: Socket;
    ready: boolean = false;
    color: number;

    get Id() {
        return this.socket.id;
    }

    private movement: number = 1;
    private positions: WebKitPoint[] = [];
    private offsetLines1: LunnNet.Utils.Line[] = [];
    private offsetLines2: LunnNet.Utils.Line[] = [];
    private _isAlive = true;

    get isAlive() {
        return this._isAlive;
    }

    get currentPosition() {
        return this.positions[0];
    }

    get currentPositionLine() {
        return { offset1: this.offsetLines1[0], offset2: this.offsetLines2[0] };
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
            this.offsetLines1.unshift(this.getOffsetLine(oldPosition, newPosition, true));
            this.offsetLines2.unshift(this.getOffsetLine(oldPosition, newPosition, false));
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
            position: this.positions[0]
        };
    }

    getOffsetLines1() {
        return this.offsetLines1;
    }

    getOffsetLines2() {
        return this.offsetLines2;
    }

    kill() {
        this._isAlive = false;
        logger.info(`player killed`);
    }

    private getOffsetLine(
        { x: x1, y: y1 }: LunnNet.Utils.Point,
        { x: x2, y: y2 }: LunnNet.Utils.Point,
        subtract: boolean
    ) {
        let L = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

        let offsetPixels = constants.playerDiameter / 2;
        if (subtract) {
            offsetPixels = -offsetPixels;
        }

        // This is the second line
        let x1p = x1 + (offsetPixels * (y2 - y1)) / L;
        let x2p = x2 + (offsetPixels * (y2 - y1)) / L;
        let y1p = y1 + (offsetPixels * (x1 - x2)) / L;
        let y2p = y2 + (offsetPixels * (x1 - x2)) / L;

        return { x1: x1p, y1: y1p, x2: x2p, y2: y2p };
    }
}
