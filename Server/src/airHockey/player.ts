import { NetworkObject } from './networkObject';
import * as p2 from 'p2';
import { Inputs } from 'src/airHockey/inputs';
import { Team, TeamSide } from 'src/airHockey/team';

export class Player extends NetworkObject {
    readonly DIAMETER = 60;
    private SPEED = 600;
    private gameWidth: number;

    id: string;
    socket: SocketIO.Socket;
    isReady: boolean;

    input: Inputs;
    team: Team;

    constructor(world: p2.World, socket: SocketIO.Socket, team: Team, gameWidth: number) {
        super(world);
        this.gameWidth = gameWidth;
        this.team = team;
        this.id = socket.id;
        this.socket = socket;

        const shape = new p2.Circle({
            radius: this.DIAMETER / 2
        });
        this.body.addShape(shape);
    }

    onUpdate(): void {
        const input = [0, 0];

        if (this.input.isDown('up')) {
            input[1] += this.SPEED;
        }
        if (this.input.isDown('down')) {
            input[1] -= this.SPEED;
        }
        if (this.input.isDown('left')
            && (this.team.TeamSide !== TeamSide.Right || this.body.position[0] > (this.gameWidth / 2 + this.DIAMETER / 2))) {
            input[0] -= this.SPEED;
        }
        if (this.input.isDown('right')
            && (this.team.TeamSide !== TeamSide.Left || this.body.position[0] < (this.gameWidth / 2 - this.DIAMETER / 2))) {
            input[0] += this.SPEED;
        }

        this.body.velocity[1] = this.pxmi(input[1]);
        this.body.velocity[0] = this.pxmi(input[0]);
    }

    private pxmi(v: number) {
        return v * -0.05;
    }
}
