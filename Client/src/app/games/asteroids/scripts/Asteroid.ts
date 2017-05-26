import * as p2 from 'p2';
import { Utils } from './Utils';

export class Asteroid {


    static MaxAsteroidSpeed = 2;
    static NumAsteroidLevels = 4;
    static NumAsteroidVerticals = 10;
    static AsteroidRadius = 0.5;
    static InitSpace = Asteroid.AsteroidRadius * 2;
    static MaxLevel = 3;
    static Splits = 4;

    body: p2.Body;
    verticals: number[][] = [];
    level: number;
    bodyGraphics: PIXI.Graphics;

    private fillColor = 0x7A5230;
    private strokeColor = 0xAC7339;
    private strokeWidth = 0.05;

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
        this.addAsteroidVerticals();

        asteroidBody.fromPolygon(this.verticals);
        asteroidBody.shapes.forEach(shp => {
            shp.collisionGroup = Utils.MASKS.ASTEROID;
            shp.collisionMask = Utils.MASKS.ASTEROID | Utils.MASKS.BULLET | Utils.MASKS.PLAYER | Utils.MASKS.POWER_UP;
        });
        this.body = asteroidBody;
    }

    explode() {
        // Add new sub-asteroids
        const subAsteroids: Asteroid[] = [];

        if (this.level < Asteroid.MaxLevel) {
            const angleDisturb = Math.PI / 2 * (Math.random() - 0.5);
            for (let i = 0; i < this.level + 2; i++) {
                const angle = Math.PI / 2 * i + angleDisturb;
                const position = this.getSubAstroidPosition(this.body.interpolatedPosition, this.getRadius(), i, Asteroid.Splits);
                const subAsteroid = this.createSubAsteroid(position[0], position[1], angle);
                subAsteroids.push(subAsteroid);
            }
        }
        return subAsteroids;
    }

    update() {
        this.bodyGraphics.x = this.body.interpolatedPosition[0];
        this.bodyGraphics.y = this.body.interpolatedPosition[1];
        this.bodyGraphics.rotation = this.body.interpolatedAngle;
    }

    createBodyGraphics() {
        const concavePath = this.body.concavePath;
        this.bodyGraphics = new PIXI.Graphics();
        this.bodyGraphics.lineStyle(this.strokeWidth, this.strokeColor);
        this.bodyGraphics.beginFill(this.fillColor);
        for (let j = 0; j < concavePath.length; j++) {
            const xv = concavePath[j][0];
            const yv = concavePath[j][1];
            if (j === 0) {
                this.bodyGraphics.moveTo(xv, yv);
            } else {
                this.bodyGraphics.lineTo(xv, yv);
            }
        }
        this.bodyGraphics.endFill();
        if (concavePath.length > 2) {
            this.bodyGraphics.moveTo(concavePath[concavePath.length - 1][0], concavePath[concavePath.length - 1][1]);
            this.bodyGraphics.lineTo(concavePath[0][0], concavePath[0][1]);
        }

        return this.bodyGraphics;
    }

    private getSubAstroidPosition(bodyPosition: number[], radius: number, index: number, totalSplits: number) {
        if (totalSplits === 1) {
            return bodyPosition.splice(0);
        }
        return [this.body.position[0] + (radius / 1.25) * ((index <= totalSplits / 2) ? 1 : -1),
        this.body.position[1] + (radius / 1.25) * (index % 2 === 0 ? 1 : -1)];
    }

    private createSubAsteroid(x: number, y: number, angle: number) {
        const r = this.getRadius() / 2;
        const position = [
            x + r * Math.cos(angle),
            y + r * Math.sin(angle)
        ];

        const velocity = [Math.random() - 0.5, Math.random() - 0.5];

        const subAsteroid = new Asteroid(position, velocity, this.body.angularVelocity, this.level + 1);
        return subAsteroid;
    }

    // Adds random to an asteroid body
    private addAsteroidVerticals() {
        this.verticals = [];
        const radius = this.getRadius();
        for (let j = 0; j < Asteroid.NumAsteroidVerticals; j++) {
            const angle = j * 2 * Math.PI / Asteroid.NumAsteroidVerticals;
            const xv = Number((radius * Math.cos(angle) + (Math.random() - 0.5) * radius * 0.4).toFixed(2));
            const yv = Number((radius * Math.sin(angle) + (Math.random() - 0.5) * radius * 0.4).toFixed(2));
            this.verticals.push([xv, yv]);
        }
    }

    private getRadius() {
        return Asteroid.AsteroidRadius * (Asteroid.NumAsteroidLevels - this.level) / Asteroid.NumAsteroidLevels
    }
}
