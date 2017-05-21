import * as p2 from 'p2';
import { Asteroid } from './Asteroid';


export class Bullet {

    static BULLET = Math.pow(2, 2);
    static BulletRadius = 0.03;
    static BulletLifeTime = 2;

    body: p2.Body;
    shape: p2.Circle;
    dieTime: number;

    constructor(angle: number, radius: number, position: number[], velocity: number[], worldTime: number) {
        const bulletBody = new p2.Body({
            mass: 0.05,
            position: [
                radius * Math.cos(angle) + position[0],
                radius * Math.sin(angle) + position[1]
            ],
            // damping: 0,
            velocity: [ // initial velocity in ship direction
                2 * Math.cos(angle) + velocity[0],
                2 * Math.sin(angle) + velocity[1]
            ],
        });
        bulletBody.damping = 0;

        const bulletShape = new p2.Circle({
            radius: Bullet.BulletRadius,
            collisionGroup: Bullet.BULLET, // Belongs to the BULLET group
            collisionMask: Asteroid.ASTEROID // Can only collide with the ASTEROID group
        });
        bulletBody.addShape(bulletShape);

        this.body = bulletBody;
        this.dieTime = worldTime + Bullet.BulletLifeTime;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const x = this.body.interpolatedPosition[0];
        const y = this.body.interpolatedPosition[1];
        ctx.beginPath();
        ctx.arc(x, y, Bullet.BulletRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }
}
