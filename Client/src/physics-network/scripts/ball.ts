import * as Phaser from 'phaser-ce';

export class Ball {
    sprite: Phaser.Sprite;
    private readonly MAX_VELOCITY = 70;

    constructor(game: Phaser.Game, options: LunnNet.PhysicsNetwork.BallOptions) {
        this.sprite = this.createSprite(game, options);
    }

    onNetworkUpdate(data: LunnNet.PhysicsNetwork.BallUpdate) {
        this.sprite.body.setZeroVelocity();

        this.sprite.body.angularVelocity = data.angularVelocity;
        this.sprite.body.x = data.position.x;
        this.sprite.body.y = data.position.y;
        this.sprite.data.velocity = data.velocity;
    }

    onUpdate() {
        this.constrainVelocity(this.sprite, this.MAX_VELOCITY);
    }

    private createSprite(game: Phaser.Game, options: LunnNet.PhysicsNetwork.BallOptions) {
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

    private constrainVelocity(sprite: Phaser.Sprite, maxVelocity: number) {
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
