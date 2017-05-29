import { Utils } from './Utils';
import * as p2 from 'p2';
import { Sprites } from './Sprites';
import { Player } from './Player';

export class BasePowerUp {

    sprite: PIXI.Sprite;
    body: p2.Body;
    isActive: boolean;

    constructor(sprite: PIXI.Sprite, position: number[], velocity: number[], angularVelocity: number) {
        this.sprite = sprite;
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;

        this.body = new p2.Body({
            mass: 0.01,
            position: position,
            velocity: velocity,
            angularVelocity: angularVelocity
        });
        this.body.damping = 0;
        this.body.angularDamping = 0;
        this.body.previousPosition = this.body.position;

        const shape = new p2.Box({
            height: this.sprite.height,
            width: this.sprite.width
        });
        shape.collisionGroup = Utils.MASKS.POWER_UP;
        shape.collisionMask = Utils.MASKS.PLAYER | Utils.MASKS.POWER_UP | Utils.MASKS.BULLET | Utils.MASKS.ASTEROID;
        this.body.addShape(shape);
    }

    update() {
        this.sprite.x = this.body.interpolatedPosition[0];
        this.sprite.y = this.body.interpolatedPosition[1];
        this.sprite.rotation = this.body.interpolatedAngle;
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
    private graphics: PIXI.Graphics;
    private shape: p2.Circle;
    private radius = 80;

    constructor(position: number[], velocity: number[], angularVelocity: number) {
        super(Sprites.getCloneSprite(Sprites.PowerUps.Shield), position, velocity, angularVelocity);
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

        this.shape = new p2.Circle({
            position: player.body.interpolatedPosition,
            radius: this.radius * player.sprite.scale.x,
            collisionGroup: Utils.MASKS.PLAYER,
            collisionMask: player.body.shapes[0].collisionMask
        });
        player.body.addShape(this.shape);

        super.activate(player);
    }

    deactivate(player: Player) {
        player.hasShield = false;
        player.sprite.removeChild(this.graphics);
        player.body.removeShape(this.shape);
        super.deactivate(player);
    }

    private warn = () => {
        this.graphics.visible = !this.graphics.visible;

        if (this.isActive) {
            setTimeout(() => {
                this.warn();
            }, 200);
        }
    }

    private createShieldGraphics(player: Player) {
        this.graphics = new PIXI.Graphics();
        this.graphics.beginFill(0x428cf4, 0.5);
        this.graphics.drawCircle(player.sprite.position.x, player.sprite.position.y, this.radius);
        this.graphics.endFill();
        player.sprite.addChild(this.graphics);
    }
}

export class PowerUpShootSpeed extends BasePowerUp {
    private shootSpeedIncrease = 0.5;
    private durationMs = 5000;

    constructor(position: number[], velocity: number[], angularVelocity: number) {
        super(Sprites.getCloneSprite(Sprites.PowerUps.ShootSpeed), position, velocity, angularVelocity);
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
