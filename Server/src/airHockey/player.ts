import { NetworkObject } from './networkObject';
import * as p2 from 'p2';

export class Player extends NetworkObject {
    readonly DIAMETER = 60;
    private SPEED = 600;

    id: string;
    socket: SocketIO.Socket;
    isReady: boolean;

    constructor(world: p2.World, socket: SocketIO.Socket) {
        super(world);
        this.id = socket.id;
        this.socket = socket;

        const shape = new p2.Circle({
            radius: this.DIAMETER / 2
        });
        this.body.addShape(shape);
    }

    onUpdate(): void {
    }
}
