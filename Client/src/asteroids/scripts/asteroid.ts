import * as Phaser from 'phaser-ce';
import { Utils } from './utils';
import { eventEmitter, Events } from './events';

export class Asteroid {

    static MaxAsteroidSpeed = 2;
    static NumAsteroidLevels = 4;
    static NumAsteroidVerticals = 10;
    static AsteroidRadius = 50;
    static InitSpace = Asteroid.AsteroidRadius * 2;
    static MaxLevel = 3;
    static Splits = 4;

    level: number;
    sprite: Phaser.Sprite;

    private fillColor = 0xbfbfbf;
    private strokeColor = 0x6d6d6d;
    private strokeWidth = 4;

    constructor(
        game: Phaser.Game,
        position: WebKitPoint,
        velocity: WebKitPoint,
        angularVelocity: number,
        level: number) {

        this.level = level;

        const verticals = this.addAsteroidVerticals();

        const graphics = new Phaser.Graphics(game);
        this.createBodyGraphics(graphics, verticals);

        const sprite = game.add.sprite(position.x, position.y, graphics.generateTexture());
        game.physics.p2.enable(sprite);
        sprite.body.addPolygon({}, verticals);

        sprite.body.setCollisionGroup(Utils.MASKS.ASTEROID);
        sprite.body.collides([game.physics.p2.everythingCollisionGroup, Utils.MASKS.ASTEROID, Utils.MASKS.BULLET, Utils.MASKS.PLAYER, Utils.MASKS.POWER_UP]);
        sprite.body.mass = 10 / (level + 1);
        sprite.body.velocity.x = velocity.x;
        sprite.body.velocity.y = velocity.y;
        sprite.body.angularVelocity = angularVelocity;
        sprite.body.damping = 0;
        sprite.body.angularDamping = 0;

        sprite.body.createGroupCallback(Utils.MASKS.BULLET, (asteroidBody: Phaser.Physics.P2.Body, impactedBody: Phaser.Physics.P2.Body) => {
            eventEmitter.emit(Events.AsteroidDestroyed, asteroidBody, impactedBody);
        }, this);

        sprite.body.createGroupCallback(Utils.MASKS.PLAYER, () => {
            eventEmitter.emit(Events.AsteroidPlayerHit);
        }, this);

        sprite.data = this;
        this.sprite = sprite;
    }

    explode = () => {
        if (this.level < Asteroid.MaxLevel) {
            const angleDisturb = Math.PI / 2 * (Math.random() - 0.5);
            for (let i = 0; i < this.level + 2; i++) {
                const angle = Math.PI / 2 * i + angleDisturb;
                const position = this.getSubAstroidPosition(this.sprite.body.data.interpolatedPosition, this.getRadius(), i, Asteroid.Splits);
                this.createSubAsteroid(position[0], position[1], angle);
            }
        }
    }

    private createBodyGraphics(graphics: Phaser.Graphics, concavePath: number[][]) {
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

    private getSubAstroidPosition = (bodyPosition: number[], radius: number, index: number, totalSplits: number) => {
        if (totalSplits === 1) {
            return bodyPosition.splice(0);
        }
        return [this.sprite.body.x + (radius / 1.25) * ((index <= totalSplits / 2) ? 1 : -1),
        this.sprite.body.y + (radius / 1.25) * (index % 2 === 0 ? 1 : -1)];
    }

    private createSubAsteroid = (x: number, y: number, angle: number) => {
        const r = this.getRadius() / 2;
        const position = {
            x: x + r * Math.cos(angle),
            y: y + r * Math.sin(angle)
        };

        const velocity = { x: Math.random() - 0.5, y: Math.random() - 0.5 };

        const subAsteroid = new Asteroid(this.sprite.game, position, velocity, this.sprite.body.angularVelocity, this.level + 1);
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
