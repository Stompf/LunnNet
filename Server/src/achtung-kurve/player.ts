import { Socket } from 'socket.io';

export class Player {
    static speed = 0.1;

    socket: Socket;

    private get Id() {
        return this.socket.id;
    }

    private color: number;
    private movement: number = 1;
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
        const oldPosition = this.positions[0];
        const velocityX = Math.cos(this.movement) * Player.speed;
        const velocityY = Math.sin(this.movement) * Player.speed;
        const newPosition = {
            x: oldPosition.x + deltaTime * velocityX,
            y: oldPosition.y + deltaTime * velocityY
        };
        if (newPosition.x !== oldPosition.x || newPosition.y !== oldPosition.y) {
            this.positions.unshift(newPosition);
        }
    }

    onClientUpdate(data: LunnNet.AchtungKurve.UpdateFromClient) {
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
}
