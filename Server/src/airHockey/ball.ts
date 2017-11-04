import { NetworkObject } from './networkObject';
import * as p2 from 'p2';

export class Ball extends NetworkObject {
    private readonly DIAMETER = 30;
    private readonly MAX_VELOCITY = 70;

    constructor(world: p2.World) {
        super(world);

        const shape = new p2.Circle({
            radius: this.DIAMETER / 2
        });

        this.body.mass = 0.1;
        this.body.addShape(shape);
    }

    onUpdate() {
        this.constrainVelocity(this.body, this.MAX_VELOCITY);
    }

    resetVelocity(velocityX?: number) {
        this.body.velocity = [velocityX ? velocityX : 0, 0];
    }

    private constrainVelocity(body: p2.Body, maxVelocity: number) {
        let angle, currVelocitySqr, vx, vy;

        vx = body.velocity[0];
        vy = body.velocity[1];

        currVelocitySqr = vx * vx + vy * vy;

        if (currVelocitySqr > maxVelocity * maxVelocity) {
            angle = Math.atan2(vy, vx);

            vx = Math.cos(angle) * maxVelocity;
            vy = Math.sin(angle) * maxVelocity;

            body.velocity[0] = vx;
            body.velocity[1] = vy;
        }
    }
}
