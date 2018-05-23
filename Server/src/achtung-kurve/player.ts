import { Socket } from 'socket.io';

export class Player {
    socket: Socket;

    private get Id() {
        return this.socket.id;
    }

    private color: number;
    private movement: number = 0;
    private speed = 100;
    private positions: WebKitPoint[] = [];

    constructor(color: number, socket: Socket) {
        this.socket = socket;
        this.color = color;
    }

    setStart(movement: number, position: WebKitPoint) {
        this.movement = movement;
        this.positions = [position];
    }

    onUpdate(deltaTime: number) {
        const velocityX = Math.cos(this.movement) * this.speed;
        const velocityY = Math.sin(this.movement) * this.speed;

        this.positions.push({ x: deltaTime * velocityX, y: deltaTime * velocityY });
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
            positions: this.positions
        };
    }
}
