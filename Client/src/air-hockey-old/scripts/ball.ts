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

    setPosition(position: WebKitPoint) {
        this.sprite.body.x = position.x;
        this.sprite.body.y = position.y;
    }

    getPosition() {
        return { x: this.sprite.body.x, y: this.sprite.body.y };
    }

    onUpdate() {
        this.constrainVelocity(this.sprite, this.MAX_VELOCITY);
    }

    resetVelocity(velocityX?: number) {
        this.sprite.body.data.velocity = [velocityX ? velocityX : 0, 0];
    }

    setDebug(debug: boolean) {
        this.sprite.body.debug = debug;
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
