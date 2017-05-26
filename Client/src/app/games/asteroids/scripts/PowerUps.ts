import { Utils } from './Utils';
import * as p2 from 'p2';
import { Sprites } from './Sprites';
import { Player } from './Player';

export class BasePowerUp {

    sprite: PIXI.Sprite;
    body: p2.Body;

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

    onActivate(_player: Player) {
        // Override what happens when activating
    }
}

export class PowerUpShield extends BasePowerUp {
    constructor(position: number[], velocity: number[], angularVelocity: number) {
        super(Sprites.getCloneSprite(Sprites.PowerUps.Shield), position, velocity, angularVelocity);
    }

    onActivate(_player: Player) {
        // Override what happens when activating
    }
}

export class PowerUpShootSpeed extends BasePowerUp {
    constructor(position: number[], velocity: number[], angularVelocity: number) {
        super(Sprites.getCloneSprite(Sprites.PowerUps.ShootSpeed), position, velocity, angularVelocity);
    }

    onActivate(_player: Player) {
        // Override what happens when activating
    }
}
