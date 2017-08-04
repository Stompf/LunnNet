import * as Phaser from 'phaser-ce';

export class Ball {
    private readonly DIAMETER = 30;
    private readonly MAX_VELOCITY = 70;
    private sprite: Phaser.Sprite;

    constructor(game: Phaser.Game) {
        const graphics = new Phaser.Graphics(game);
        graphics.beginFill(0x000000);
        graphics.drawCircle(0, 0, this.DIAMETER);
        this.sprite = game.add.sprite(0, 0, graphics.generateTexture());

        game.physics.p2.enable(this.sprite);
        this.sprite.body.setCircle(this.DIAMETER / 2);
        this.sprite.body.mass = 0.1;
    }

    setPosition(position: Phaser.Point) {
        this.sprite.body.x = position.x;
        this.sprite.body.y = position.y;
    }

    getPosition() {
        return { x: this.sprite.body.x, y: this.sprite.body.y };
    }

    onUpdate() {
        this.constrainVelocity(this.sprite, this.MAX_VELOCITY);
    }

    private constrainVelocity(sprite: Phaser.Sprite, maxVelocity: number) {
        var body = sprite.body;
        var angle, currVelocitySqr, vx, vy;

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