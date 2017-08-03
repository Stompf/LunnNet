import * as Phaser from 'phaser-ce';

export class Ball {
    private diameter = 30;
    private sprite: Phaser.Sprite;

    constructor(game: Phaser.Game) {
        const graphics = new Phaser.Graphics(game);
        graphics.beginFill(0x000000);
        graphics.drawCircle(0, 0, this.diameter);
        this.sprite = game.add.sprite(0, 0, graphics.generateTexture());

        game.physics.p2.enable(this.sprite);
        this.sprite.body.mass = 0.1;
    }

    setPosition(position: Phaser.Point) {
        this.sprite.body.x = position.x;
        this.sprite.body.y = position.y;
    }

    getPosition() {
        return this.sprite.position;
    }
}