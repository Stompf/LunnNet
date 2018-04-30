import { P2Sprite } from '../models/achtung';

export class BaseSprite {
    sprite: P2Sprite;

    constructor(sprite: P2Sprite) {
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
