import { ArcadeSprite } from 'src/models';

export class BaseSprite {
    sprite: ArcadeSprite;

    constructor(sprite: ArcadeSprite) {
        this.sprite = sprite;
    }

    setPosition(position: WebKitPoint) {
        this.sprite.x = position.x;
        this.sprite.y = position.y;
    }

    getPosition() {
        return this.sprite.position;
    }

    resetVelocity(velocityX?: number, velocityY?: number) {
        this.sprite.body.velocity.setTo(velocityX ? velocityX : 0, velocityY ? velocityY : 0);
    }
}
