import * as Phaser from 'phaser-ce';
import { Utils } from './Utils';

export class Asteroid {

    static MaxAsteroidSpeed = 2;
    static NumAsteroidLevels = 4;
    static NumAsteroidVerticals = 10;
    static AsteroidRadius = 0.5;
    static InitSpace = Asteroid.AsteroidRadius * 2;
    static MaxLevel = 3;
    static Splits = 4;

    verticals: number[][] = [];
    level: number;
    graphics: Phaser.Graphics;

    private fillColor = 0xbfbfbf;
    private strokeColor = 0x6d6d6d;
    private strokeWidth = 0.05;

    constructor(game: Phaser.Game, position: number[], velocity: number[], angularVelocity: number, level: number) {
        this.level = level;

        const graphics = new Phaser.Graphics(game);
        game.physics.p2.enable(graphics);

        graphics.body.addPolygon({}, this.addAsteroidVerticals());
        this.createBodyGraphics(graphics);

        graphics.position.set(position[0], position[1]);
        graphics.previousPosition = graphics.position;

        graphics.body.setCollisionGroup(Utils.MASKS.ASTEROID);
        graphics.body.collides([Utils.MASKS.ASTEROID, Utils.MASKS.BULLET, Utils.MASKS.PLAYER, Utils.MASKS.POWER_UP]);
        graphics.body.mass = 10 / (level + 1);
        graphics.body.velocity.x = velocity[0];
        graphics.body.velocity.y = velocity[1];
        graphics.body.angularVelocity = angularVelocity;
        graphics.body.damping = 0;
        graphics.body.angularDamping = 0;
    }

    explode() {
        // Add new sub-asteroids
        const subAsteroids: Asteroid[] = [];

        if (this.level < Asteroid.MaxLevel) {
            const angleDisturb = Math.PI / 2 * (Math.random() - 0.5);
            for (let i = 0; i < this.level + 2; i++) {
                const angle = Math.PI / 2 * i + angleDisturb;
                const position = this.getSubAstroidPosition(this.graphics.body.data.interpolatedPosition, this.getRadius(), i, Asteroid.Splits);
                const subAsteroid = this.createSubAsteroid(position[0], position[1], angle);
                subAsteroids.push(subAsteroid);
            }
        }
        return subAsteroids;
    }

    // update() {
    //     this.graphics.x = this.body.interpolatedPosition[0];
    //     this.graphics.y = this.body.interpolatedPosition[1];
    //     this.graphics.rotation = this.body.interpolatedAngle;
    // }

    private createBodyGraphics(graphics: Phaser.Graphics) {
        const concavePath = (graphics.body.data as any).concavePath;
        graphics.lineStyle(this.strokeWidth, this.strokeColor);
        graphics.beginFill(this.fillColor);
        for (let j = 0; j < concavePath.length; j++) {
            const xv = concavePath[j][0];
            const yv = concavePath[j][1];
            if (j === 0) {
                graphics.moveTo(xv, yv);
            } else {
                graphics.lineTo(xv, yv);
            }
        }
        graphics.endFill();
        if (concavePath.length > 2) {
            graphics.moveTo(concavePath[concavePath.length - 1][0], concavePath[concavePath.length - 1][1]);
            graphics.lineTo(concavePath[0][0], concavePath[0][1]);
        }
    }

    private getSubAstroidPosition(bodyPosition: number[], radius: number, index: number, totalSplits: number) {
        if (totalSplits === 1) {
            return bodyPosition.splice(0);
        }
        return [this.graphics.position[0] + (radius / 1.25) * ((index <= totalSplits / 2) ? 1 : -1),
        this.graphics.position[1] + (radius / 1.25) * (index % 2 === 0 ? 1 : -1)];
    }

    private createSubAsteroid(x: number, y: number, angle: number) {
        const r = this.getRadius() / 2;
        const position = [
            x + r * Math.cos(angle),
            y + r * Math.sin(angle)
        ];

        const velocity = [Math.random() - 0.5, Math.random() - 0.5];

        const subAsteroid = new Asteroid(this.graphics.game, position, velocity, this.graphics.body.angularVelocity, this.level + 1);
        return subAsteroid;
    }

    // Adds random to an asteroid body
    private addAsteroidVerticals() {
        const verticals = [];
        const radius = this.getRadius();
        for (let j = 0; j < Asteroid.NumAsteroidVerticals; j++) {
            const angle = j * 2 * Math.PI / Asteroid.NumAsteroidVerticals;
            const xv = Number((radius * Math.cos(angle) + (Math.random() - 0.5) * radius * 0.4).toFixed(2));
            const yv = Number((radius * Math.sin(angle) + (Math.random() - 0.5) * radius * 0.4).toFixed(2));
            verticals.push([xv, yv]);
        }
        return verticals;
    }

    private getRadius() {
        return Asteroid.AsteroidRadius * (Asteroid.NumAsteroidLevels - this.level) / Asteroid.NumAsteroidLevels;
    }
}
