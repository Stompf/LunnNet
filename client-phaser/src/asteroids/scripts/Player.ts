import * as Phaser from 'phaser-ce';
import { Utils } from './Utils';

export class Player {
    visible: boolean;
    allowCollision: boolean;
    hasShield: boolean;
    reloadTime = 0.2;
    turnSpeed = 4;
    lives = 3;
    points = 0;
    lastShootTime = 0;
    sprite: Phaser.Sprite;

    constructor(game: Phaser.Game) {
        this.visible = true;

        const sprite = game.add.sprite(game.world.centerX, game.world.centerY, 'player');
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        game.physics.p2.enable(sprite);
        sprite.width = 40;
        sprite.height = 30;
        sprite.body.mass = 1;
        sprite.body.damping = 0;
        sprite.body.angularDamping = 0;
        sprite.body.setRectangle(sprite.width, sprite.height);
        sprite.body.setCollisionGroup(Utils.MASKS.PLAYER);
        sprite.body.collides([Utils.MASKS.ASTEROID, Utils.MASKS.POWER_UP]);

        this.sprite = sprite;
    }
}
