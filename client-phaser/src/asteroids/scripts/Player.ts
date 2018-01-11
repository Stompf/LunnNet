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
        const sprite = game.add.sprite(0, 0, 'player');
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        game.physics.p2.enable(sprite);
        sprite.body.mass = 1;
        sprite.body.damping = 0;
        sprite.body.angularDamping = 0;
        sprite.body.setRectangle(sprite.width, sprite.height);
        sprite.body.setCollisionGroup(Utils.MASKS.PLAYER);
        sprite.body.collides([Utils.MASKS.ASTEROID, Utils.MASKS.POWER_UP]);

        this.sprite = sprite;
    }

    // update() {
    //     this.sprite.x = this.body.interpolatedPosition[0];
    //     this.sprite.y = this.body.interpolatedPosition[1];
    //     this.sprite.rotation = this.body.interpolatedAngle;
    //     this.sprite.visible = this.visible;
    // }
}
