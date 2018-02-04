import * as p2 from 'p2';
import * as winston from 'winston';

export class Ball {

    body: p2.Body;

    static readonly DIAMETER = 30;
    static readonly MASS = 0.1;
    static readonly COLOR = 0x000000;
    private readonly MAX_VELOCITY = 70;

    constructor(world: p2.World, position: WebKitPoint) {
        this.body = new p2.Body({
            mass: Ball.MASS
        });
        const circle = new p2.Circle({ radius: Ball.DIAMETER / 2 });
        this.body.addShape(circle);
        this.body.damping = 0;

        this.body.position = [position.x, position.y];
        this.body.previousPosition = this.body.position;
        world.addBody(this.body);
    }

    onUpdate() {
        this.constrainVelocity(this.body, this.MAX_VELOCITY);
    }

    toBallUpdate(): LunnNet.PhysicsNetwork.BallUpdate {
        return {
            angularVelocity: this.body.angularVelocity,
            position: { x: this.body.interpolatedPosition[0], y: this.body.interpolatedPosition[1] },
            velocity: this.body.velocity
        };
    }

    private constrainVelocity(body: p2.Body, maxVelocity: number) {
        let angle: number;
        let currVelocitySqr: number;
        let vx: number;
        let vy: number;

        vx = body.velocity[0];
        vy = body.velocity[1];

        currVelocitySqr = vx * vx + vy * vy;

        if (currVelocitySqr > maxVelocity * maxVelocity) {
            angle = Math.atan2(vy, vx);

            vx = Math.cos(angle) * maxVelocity;
            vy = Math.sin(angle) * maxVelocity;

            body.velocity[0] = vx;
            body.velocity[1] = vy;
            winston.info('constrainVelocity');
        }
    }
}
