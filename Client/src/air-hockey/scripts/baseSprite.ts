export class BaseSprite {
    sprite: Phaser.Sprite;

    constructor(sprite: Phaser.Sprite) {
        this.sprite = sprite;
    }

    setDebug(debug: boolean) {
        this.sprite.body.debug = debug;
    }

    setPosition(position: WebKitPoint) {
        this.sprite.body.x = position.x;
        this.sprite.body.y = position.y;
    }

    getPosition() {
        return this.sprite.position;
    }

    resetVelocity(velocityX?: number) {
        this.sprite.body.data.velocity = [velocityX ? velocityX : 0, 0];
    }
}
