import * as p2 from 'p2';
import { Player } from './Player';
import { Bullet } from './Bullet';

export class Asteroid {

    static ASTEROID = Math.pow(2, 3);
    static MaxAsteroidSpeed = 2;
    static NumAsteroidLevels = 4;
    static NumAsteroidVerticals = 10;
    static AsteroidRadius = 0.9;
    static InitSpace = Asteroid.AsteroidRadius * 2;

    body: p2.Body;
    verticals: number[][] = [];
    level: number;

    constructor(position: number[], velocity: number[], angularVelocity: number, level: number) {
        this.level = level;

        // Create asteroid body
        const asteroidBody = new p2.Body({
            mass: 10,
            position: position,
            velocity: velocity,
            angularVelocity: angularVelocity
        });
        asteroidBody.damping = 0;
        asteroidBody.angularDamping = 0;

        asteroidBody.addShape(this.createAsteroidShape());
        this.body = asteroidBody;
        this.addAsteroidVerticals();
    }

    explode(playerPosition: number[]) {
        // Add new sub-asteroids
        const x = this.body.position[0];
        const y = this.body.position[1];
        const subAsteroids: Asteroid[] = [];

        console.log('explode level: ' + this.level);
        if (this.level < 3) {
            const angleDisturb = Math.PI / 2 * (Math.random() - 0.5);
            for (let i = 0; i < 1; i++) {
                const angle = Math.PI / 2 * i + angleDisturb;
                const subAsteroid = this.createSubAsteroid(x, y, angle, playerPosition);
                subAsteroids.push(subAsteroid);
            }
        }

        return subAsteroids;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const x = this.body.interpolatedPosition[0];
        const y = this.body.interpolatedPosition[1];

        ctx.save();
        ctx.translate(x, y);  // Translate to the center
        ctx.rotate(this.body.interpolatedAngle);

        ctx.beginPath();
        for (let j = 0; j < Asteroid.NumAsteroidVerticals; j++) {
            const xv = this.verticals[j][0];
            const yv = this.verticals[j][1];
            if (j === 0) {
                ctx.moveTo(xv, yv);
            } else {
                ctx.lineTo(xv, yv);
            }
        }
        ctx.closePath();

        ctx.stroke();
        ctx.restore();
    }

    private createSubAsteroid(x: number, y: number, angle: number, playerPosition: number[]) {
        // const shape = this.createAsteroidShape(this.level + 1);
        // const r = (this.body.shapes[0] as p2.Circle).radius - shape.radius;

        const r = (this.body.shapes[0] as p2.Circle).radius / 2;
        const position = [
            x + r * Math.cos(angle),
            y + r * Math.sin(angle)
        ];

        // Avoid the ship!
        if (Math.abs(x - playerPosition[0]) < Asteroid.InitSpace) {
            if (y - playerPosition[1] > 0) {
                y += Asteroid.InitSpace;
            } else {
                y -= Asteroid.InitSpace;
            }
        }

        const velocity = [Math.random() - 0.5, Math.random() - 0.5];

        const subAsteroid = new Asteroid(position, velocity, this.body.angularVelocity, this.level + 1);
        return subAsteroid;
    }

    // Adds random to an asteroid body
    private addAsteroidVerticals() {
        this.verticals = [];
        const radius = (this.body.shapes[0] as p2.Circle).radius;
        for (let j = 0; j < Asteroid.NumAsteroidVerticals; j++) {
            const angle = j * 2 * Math.PI / Asteroid.NumAsteroidVerticals;
            const xv = radius * Math.cos(angle) + Math.random() * radius * 0.4;
            const yv = radius * Math.sin(angle) + Math.random() * radius * 0.4;
            this.verticals.push([xv, yv]);
        }
    }

    private createAsteroidShape() {
        const shape = new p2.Circle({
            radius: Asteroid.AsteroidRadius * (Asteroid.NumAsteroidLevels - this.level) / Asteroid.NumAsteroidLevels,
            collisionGroup: Asteroid.ASTEROID, // Belongs to the ASTEROID group
            collisionMask: Bullet.BULLET | Player.SHIP // Can collide with the BULLET or SHIP group
        });
        return shape;
    }

}
