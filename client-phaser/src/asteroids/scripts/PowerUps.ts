import { Utils } from './Utils';
import * as Phaser from 'phaser-ce';
import { Player } from './Player';

export class BasePowerUp {

    sprite: Phaser.Sprite;
    isActive: boolean;

    constructor(game: Phaser.Game, spriteName: string, position: WebKitPoint, velocity: WebKitPoint, angularVelocity: number) {
        const sprite = game.add.sprite(position.x, position.y, spriteName);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;

        game.physics.p2.enable(sprite);
        sprite.body.mass = 0.01;
        sprite.body.x = position.x;
        sprite.body.y = position.y;
        sprite.body.velocity.x = velocity.x;
        sprite.body.velocity.y = velocity.y;
        sprite.body.angularVelocity = angularVelocity;
        sprite.body.damping = 0;
        sprite.body.angularDamping = 0;
        sprite.previousPosition = sprite.position;

        sprite.body.setRectangle(sprite.width, sprite.height);
        sprite.body.setCollisionGroup(Utils.MASKS.POWER_UP);
        sprite.body.collides([Utils.MASKS.PLAYER, Utils.MASKS.POWER_UP, Utils.MASKS.BULLET, Utils.MASKS.ASTEROID]);

        this.sprite = sprite;
    }

    activate(_player: Player) {
        // Override what happens when activating
        this.isActive = true;
    }

    deactivate(_player: Player) {
        // Override what happens when deactivating
        this.isActive = false;
    }
}

export class PowerUpShield extends BasePowerUp {
    private durationMs = 7000;
    private warningMs = 2000;
    private radius = 80;
    private shieldSprite: Phaser.Sprite;

    constructor(game: Phaser.Game, position: WebKitPoint, velocity: WebKitPoint, angularVelocity: number) {
        super(game, 'powerUp_shield', position, velocity, angularVelocity);
    }

    activate(player: Player) {
        this.createShieldGraphics(player);
        player.hasShield = true;

        setTimeout(() => {
            this.warn();
        }, this.durationMs - this.warningMs);

        setTimeout(() => {
            this.deactivate(player);
        }, this.durationMs);

        super.activate(player);
    }

    deactivate(player: Player) {
        player.hasShield = false;
        super.deactivate(player);
    }

    private warn = () => {
        this.sprite.visible = !this.sprite.visible;

        if (this.isActive) {
            setTimeout(() => {
                this.warn();
            }, 200);
        }
    }

    private createShieldGraphics(player: Player) {
        const graphics = new Phaser.Graphics(player.sprite.game);

        graphics.body.setCircle(this.radius);
        graphics.body.collides([player.sprite.body.data.shapes[0].collisionMask]);

        graphics.beginFill(0x428cf4, 0.5);
        graphics.drawCircle(player.sprite.position.x, player.sprite.position.y, this.radius);
        graphics.endFill();
        player.sprite.addChild(graphics);
    }
}

export class PowerUpShootSpeed extends BasePowerUp {
    private shootSpeedIncrease = 0.5;
    private durationMs = 5000;

    constructor(game: Phaser.Game, position: WebKitPoint, velocity: WebKitPoint, angularVelocity: number) {
        super(game, 'powerUp_shootSpeed', position, velocity, angularVelocity);
    }

    activate(player: Player) {
        player.reloadTime -= this.shootSpeedIncrease;

        setTimeout(() => {
            this.deactivate(player);
        }, this.durationMs);

        super.activate(player);
    }

    deactivate(player: Player) {
        player.reloadTime += this.shootSpeedIncrease;
        super.deactivate(player);
    }
}
