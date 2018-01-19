import * as p2 from 'p2';

export class Player {
    socket: SocketIO.Socket;
    body: p2.Body;

    readonly diameter = 10;
    readonly color: number;

    constructor(world: p2.World, socket: SocketIO.Socket, color: number, startPosition: WebKitPoint) {
        this.body = new p2.Body({
            mass: 10
        });
        this.body.addShape(new p2.Circle({ radius: this.diameter / 2 }));
        world.addBody(this.body);
        this.body.position = [startPosition.x, startPosition.y];
        this.body.previousPosition = this.body.position;

        this.socket = socket;
        this.color = color;
    }

    toNewNetworkPlayer(): LunnNet.PhysicsNetwork.NewNetworkPlayer {
        return {
            body: this.body,
            color: this.color,
            id: this.socket.id,
            position: { x: this.body.position[0], y: this.body.position[1] },
            diameter: this.diameter
        };
    }
}