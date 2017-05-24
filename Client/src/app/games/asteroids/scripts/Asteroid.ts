import * as p2 from 'p2';
import { Player } from './Player';
import { Bullet } from './Bullet';
import { Sprites } from './Sprites';
export class Asteroid {

    static ASTEROID = Math.pow(2, 3);
    static MaxAsteroidSpeed = 2;
    static NumAsteroidLevels = 4;
    static NumAsteroidVerticals = 10;
    static AsteroidRadius = 0.9;
    static InitSpace = Asteroid.AsteroidRadius * 2;
    static MaxLevel = 3;
    static Splits = 4;

    body: p2.Body;
    verticals: number[][] = [];
    level: number;
    sprite: PIXI.Sprite;

    bodyGraphics: PIXI.Graphics;

    constructor(position: number[], velocity: number[], angularVelocity: number, level: number) {
        this.level = level;

        // Create asteroid body
        const asteroidBody = new p2.Body({
            mass: 10 / (level + 1),
            position: position,
            velocity: velocity,
            angularVelocity: angularVelocity
        });
        asteroidBody.damping = 0;
        asteroidBody.angularDamping = 0;
        asteroidBody.previousPosition = asteroidBody.position;

        asteroidBody.addShape(this.createAsteroidShape());
        this.body = asteroidBody;
        this.addAsteroidVerticals();
        this.getRandomSpriteForLevel();
    }

    explode(playerPosition: number[]) {
        // Add new sub-asteroids
        const x = this.body.position[0];
        const y = this.body.position[1];
        const subAsteroids: Asteroid[] = [];

        if (this.level < Asteroid.MaxLevel) {
            const angleDisturb = Math.PI / 2 * (Math.random() - 0.5);
            for (let i = 0; i < Asteroid.Splits; i++) {
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

    update() {
        this.sprite.x = this.body.interpolatedPosition[0];
        this.sprite.y = this.body.interpolatedPosition[1];
        this.sprite.rotation = this.body.interpolatedAngle;

        if (this.bodyGraphics) {
            this.bodyGraphics.x = this.body.interpolatedPosition[0];
            this.bodyGraphics.y = this.body.interpolatedPosition[1];
            this.bodyGraphics.rotation = this.body.interpolatedAngle;
        }
    }

    createBodyGraphics() {
        this.bodyGraphics = new PIXI.Graphics();
        this.bodyGraphics.beginFill(0xffffff);
        this.bodyGraphics.alpha = 0.75;
        for (let j = 0; j < Asteroid.NumAsteroidVerticals; j++) {
            const xv = this.verticals[j][0];
            const yv = this.verticals[j][1];
            if (j === 0) {
                this.bodyGraphics.moveTo(xv, yv);
            } else {
                this.bodyGraphics.lineTo(xv, yv);
            }
        }
        return this.bodyGraphics;
    }

    private getRandomSpriteForLevel() {
        const sprite = Sprites.MeteoroidSprites.getValue(this.level)[0]

        this.sprite = new PIXI.Sprite(sprite.texture.clone());
        this.sprite.scale = sprite.scale;
        this.sprite.anchor = sprite.anchor;
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
            collisionMask: Asteroid.ASTEROID | Bullet.BULLET | Player.SHIP // Can collide with the BULLET or SHIP group
        });
        return shape;
    }

}
