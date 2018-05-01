import * as Phaser from 'phaser-ce';
import { BaseSprite } from './baseSprite';
import { P2Sprite } from 'src/models';

const DEFAULT_BALL_OPTIONS: LunnNet.AirHockey.BallOptions = {
    mass: 0.1,
    diameter: 30,
    color: 0x000000,
    maxVelocity: 50
};

export class Ball extends BaseSprite {
    private readonly MAX_VELOCITY: number;

    constructor(game: Phaser.Game, options?: LunnNet.AirHockey.BallOptions) {
        super(Ball.createSprite(game, options || DEFAULT_BALL_OPTIONS));
        this.MAX_VELOCITY = options ? options.maxVelocity : DEFAULT_BALL_OPTIONS.maxVelocity;
    }

    onNetworkUpdate(data: LunnNet.AirHockey.BallUpdate) {
        this.sprite.body.setZeroVelocity();

        this.sprite.body.angularVelocity = data.angularVelocity;
        this.sprite.body.x = data.position.x;
        this.sprite.body.y = data.position.y;
        this.sprite.data.velocity = data.velocity;
    }

    onUpdate() {
        this.constrainVelocity(this.sprite, this.MAX_VELOCITY);
    }

    static createSprite(game: Phaser.Game, options: LunnNet.AirHockey.BallOptions) {
        Phaser.Component.Core.skipTypeChecks = true;

        const graphics = new Phaser.Graphics(game);
        graphics.beginFill(options.color);
        graphics.drawCircle(0, 0, options.diameter);

        const sprite = game.add.sprite(
            game.world.centerX,
            game.world.centerY,
            graphics.generateTexture()
        );
        game.physics.p2.enable(sprite);
        sprite.body.setCircle(options.diameter / 2);
        sprite.body.mass = options.mass;
        return sprite;
    }

    private constrainVelocity(sprite: P2Sprite, maxVelocity: number) {
        const body = sprite.body;
        let angle, currVelocitySqr, vx, vy;

        vx = body.data.velocity[0];
        vy = body.data.velocity[1];

        currVelocitySqr = vx * vx + vy * vy;

        if (currVelocitySqr > maxVelocity * maxVelocity) {
            angle = Math.atan2(vy, vx);

            vx = Math.cos(angle) * maxVelocity;
            vy = Math.sin(angle) * maxVelocity;

            body.data.velocity[0] = vx;
            body.data.velocity[1] = vy;
        }
    }
}
