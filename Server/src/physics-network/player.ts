import * as p2 from 'p2';

export class Player {
    socket: SocketIO.Socket;
    body: p2.Body;

    static readonly DIAMETER = 60;
    readonly COLOR: number;

    private SPEED = 700;

    constructor(world: p2.World, socket: SocketIO.Socket, color: number, startPosition: WebKitPoint) {
        this.body = new p2.Body({
            mass: 10
        });
        this.body.addShape(new p2.Circle({ radius: Player.DIAMETER / 2 }));
        world.addBody(this.body);
        this.body.position = [startPosition.x, startPosition.y];
        this.body.previousPosition = this.body.position;
        //  this.body.type = p2.Body.STATIC;
        this.socket = socket;
        this.COLOR = color;
    }

    toNewNetworkPlayer(): LunnNet.PhysicsNetwork.NewNetworkPlayer {
        return {
            color: this.COLOR,
            id: this.socket.id,
            position: { x: this.body.position[0], y: this.body.position[1] },
            diameter: Player.DIAMETER
        };
    }

    toUpdateNetworkPlayerPlayer(): LunnNet.PhysicsNetwork.UpdateNetworkPlayer {
        return {
            id: this.socket.id,
            position: { x: this.body.interpolatedPosition[0], y: this.body.interpolatedPosition[1] }
        };
    }

    moveUp(input: number) {
        if (input === 0) {
            this.body.velocity[1] = 0;
        } else {
            this.body.velocity[1] = this.pxmi(input > 0 ? -this.SPEED : this.SPEED);
        }
    }

    moveRight(input: number) {
        if (input === 0) {
            this.body.velocity[0] = 0;
        } else {
            this.body.velocity[0] = this.pxmi(input > 0 ? -this.SPEED : this.SPEED);
        }
    }

    private pxmi(v: number) {
        return v * -0.05;
    }
}