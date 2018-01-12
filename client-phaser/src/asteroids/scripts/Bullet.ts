import { Utils } from './Utils';
import * as Phaser from 'phaser-ce';

export class Bullet {
    static BulletRadius = 3;
    static BulletLifeTime = 0.9;
    static BulletSpeed = 1200;

    shape: p2.Circle;
    dieTime: number;
    sprite: Phaser.Sprite;

    constructor(game: Phaser.Game, angle: number, position: WebKitPoint, velocity: WebKitPoint, worldTime: number) {
        const graphics = new Phaser.Graphics(game);
        graphics.beginFill(0xffffff);
        graphics.arc(0, 0, Bullet.BulletRadius, 0, 2 * Math.PI, false);

        const sprite = game.add.sprite(position.x, position.y, graphics.generateTexture());

        game.physics.p2.enable(sprite);
        sprite.body.mass = 0.05;
        sprite.body.velocity.x = Bullet.BulletSpeed * Math.cos(angle) + velocity.x;
        sprite.body.velocity.y = Bullet.BulletSpeed * Math.sin(angle) + velocity.y;
        sprite.body.damping = 0;
        sprite.body.angularDamping = 0;
        sprite.body.setCircle(Bullet.BulletRadius);

        sprite.body.setCollisionGroup(Utils.MASKS.BULLET);
        sprite.body.collides([Utils.MASKS.ASTEROID, Utils.MASKS.POWER_UP]);

        this.dieTime = worldTime + Bullet.BulletLifeTime;
        this.sprite = sprite;
    }
}
