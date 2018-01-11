import { Utils } from './Utils';
import * as Phaser from 'phaser-ce';

export class Bullet {
    static BulletRadius = 0.03;
    static BulletLifeTime = 0.9;
    static BulletSpeed = 6;

    shape: p2.Circle;
    dieTime: number;
    graphics: Phaser.Graphics;

    constructor(game: Phaser.Game, angle: number, position: WebKitPoint, velocity: WebKitPoint, worldTime: number) {
        const graphics = new Phaser.Graphics(game);
        graphics.beginFill(0xffffff);
        graphics.arc(0, 0, Bullet.BulletRadius, 0, 2 * Math.PI, false);

        game.physics.p2.enable(graphics);
        graphics.body.mass = 0.05;
        graphics.position.set(0.3 * Math.cos(angle) + position.x, 0.3 * Math.sin(angle) + position.y);
        graphics.body.velocity.x = Bullet.BulletSpeed * Math.cos(angle) + velocity.x;
        graphics.body.velocity.y = Bullet.BulletSpeed * Math.sin(angle) + velocity.y;
        graphics.body.damping = 0;
        graphics.body.angularDamping = 0;
        graphics.body.setCircle(Bullet.BulletRadius);

        // Belongs to the BULLET group
        graphics.body.setCollisionGroup(Utils.MASKS.BULLET);

        // Can only collide with the ASTEROID group
        graphics.body.collides([Utils.MASKS.ASTEROID, Utils.MASKS.POWER_UP]);

        this.dieTime = worldTime + Bullet.BulletLifeTime;
        this.graphics = graphics;
    }

    // update() {
    //     this.graphics.x = this.body.interpolatedPosition[0];
    //     this.graphics.y = this.body.interpolatedPosition[1];
    // }
}
