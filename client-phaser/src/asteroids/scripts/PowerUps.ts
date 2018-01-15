import { Utils } from './Utils';
import * as Phaser from 'phaser-ce';
import { Player } from './Player';
import { Events, eventEmitter } from './Events';

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
        sprite.body.collides([game.physics.p2.everythingCollisionGroup, Utils.MASKS.PLAYER, Utils.MASKS.POWER_UP, Utils.MASKS.BULLET, Utils.MASKS.ASTEROID]);

        sprite.body.createGroupCallback(Utils.MASKS.PLAYER, (thisBody: Phaser.Physics.P2.Body, playerBody: Phaser.Physics.P2.Body) => {
            if ((playerBody.sprite.data as Player).hasShield) {
                return;
            }

            this.activate(playerBody.sprite.data);
            eventEmitter.emit(Events.PowerUpActivated, this);
        }, this);

        sprite.data = this;

        this.sprite = sprite;
    }

    activate(_player: Player) {
        // Override what happens when activating
        this.sprite.destroy();
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
    private timer: Phaser.Timer;

    constructor(game: Phaser.Game, position: WebKitPoint, velocity: WebKitPoint, angularVelocity: number) {
        super(game, 'powerUp_shield', position, velocity, angularVelocity);
        this.timer = game.time.create();
    }

    activate(player: Player) {
        this.radius = player.sprite.width * 3;

        this.createShieldGraphics(player);
        player.hasShield = true;

        this.timer.add(this.durationMs, () => { this.deactivate(player); }, this);
        this.timer.add(this.durationMs - this.warningMs, this.warn, this);
        this.timer.start();

        super.activate(player);
    }

    deactivate(player: Player) {
        player.hasShield = false;
        this.shieldSprite.destroy();
        super.deactivate(player);
    }

    private warn = () => {
        this.shieldSprite.visible = !this.shieldSprite.visible;

        if (this.isActive) {
            setTimeout(() => {
                this.warn();
            }, 200);
        }
    }

    private createShieldGraphics(player: Player) {
        const graphics = new Phaser.Graphics(player.sprite.game);
        graphics.beginFill(0x428cf4, 0.5);
        graphics.drawCircle(0, 0, this.radius);
        graphics.endFill();

        const shieldSprite = graphics.game.add.sprite(0, 0, graphics.generateTexture());
        graphics.game.physics.p2.enable(shieldSprite);

        shieldSprite.body.setCircle(this.radius);
        shieldSprite.body.setCollisionGroup(shieldSprite.game.physics.p2.everythingCollisionGroup);
        shieldSprite.body.collides(player.sprite.body.collidesWith);
        shieldSprite.body.static = true;

        player.sprite.addChild(shieldSprite);
        this.shieldSprite = shieldSprite;
    }
}

export class PowerUpShootSpeed extends BasePowerUp {
    private shootSpeedIncrease = 0.5;
    private durationMs = 5000;
    private timer: Phaser.Timer;

    constructor(game: Phaser.Game, position: WebKitPoint, velocity: WebKitPoint, angularVelocity: number) {
        super(game, 'powerUp_shootSpeed', position, velocity, angularVelocity);
        this.timer = game.time.create();
    }

    activate(player: Player) {
        player.reloadTime -= this.shootSpeedIncrease;
        this.timer.add(this.durationMs, () => { this.deactivate(player); }, this);
        this.timer.start();

        super.activate(player);
    }

    deactivate(player: Player) {
        player.reloadTime += this.shootSpeedIncrease;
        super.deactivate(player);
    }
}
