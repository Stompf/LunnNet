import * as p2 from 'p2';
import { Team } from './team';

export class Player {
    socket: SocketIO.Socket;
    body: p2.Body;
    team: Team;

    static readonly DIAMETER = 60;
    static readonly MASS = 10;
    static readonly SPEED = 700;

    readonly COLOR: number;

    constructor(world: p2.World, socket: SocketIO.Socket, color: number, team: Team) {
        this.body = new p2.Body({
            mass: Player.MASS
        });
        this.body.addShape(new p2.Circle({ radius: Player.DIAMETER / 2 }));
        world.addBody(this.body);
        this.socket = socket;
        this.COLOR = color;
        this.team = team;
    }

    setPosition(position: WebKitPoint) {
        this.body.velocity = [0, 0];
        this.body.position = [position.x, position.y];
        this.body.previousPosition = this.body.position;
    }

    toNewNetworkPlayer(): LunnNet.PhysicsNetwork.NewNetworkPlayer {
        return {
            color: this.COLOR,
            id: this.socket.id,
            position: { x: this.body.position[0], y: this.body.position[1] },
            diameter: Player.DIAMETER,
            mass: Player.MASS,
            speed: Player.SPEED
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
            this.body.velocity[1] = this.pxmi(input > 0 ? -Player.SPEED : Player.SPEED);
        }
    }

    moveRight(input: number) {
        if (input === 0) {
            this.body.velocity[0] = 0;
        } else {
            this.body.velocity[0] = this.pxmi(input > 0 ? -Player.SPEED : Player.SPEED);
        }
    }

    private pxmi(v: number) {
        return v * -0.05;
    }
}
