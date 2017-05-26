import * as p2 from 'p2';
import { Utils } from './Utils';
// import * as PIXI from 'pixi.js';

export class Player {
    visible: boolean;
    allowCollision: boolean;
    body: p2.Body;
    reloadTime = 0.2;
    turnSpeed = 4;
    lives = 3;
    lastShootTime = 0;
    sprite: PIXI.Sprite;

    bodyGraphics: PIXI.Graphics;

    constructor(sprite: PIXI.Sprite) {
        this.sprite = sprite;
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
    }

    init(world: p2.World) {
        this.visible = true;

        this.body = new p2.Body({
            mass: 1
        });
        this.body.damping = 0;
        this.body.angularDamping = 0;

        if (this.body.shapes.length > 0) {
            this.body.removeShape(this.body.shapes[0]);
        }

        const shape = new p2.Box({
            height: this.sprite.height,
            width: this.sprite.width
        });
        shape.collisionGroup = Utils.MASKS.PLAYER;
        shape.collisionMask = Utils.MASKS.ASTEROID | Utils.MASKS.POWER_UP;
        this.body.addShape(shape);

        this.createBodyGraphics();

        world.addBody(this.body);
    }

    update() {
        this.sprite.x = this.body.interpolatedPosition[0];
        this.sprite.y = this.body.interpolatedPosition[1];
        this.sprite.rotation = this.body.interpolatedAngle;
        this.sprite.visible = this.visible;

        if (this.bodyGraphics) {
            this.bodyGraphics.visible = this.visible;
            this.bodyGraphics.x = this.body.interpolatedPosition[0];
            this.bodyGraphics.y = this.body.interpolatedPosition[1];
            this.bodyGraphics.rotation = this.body.interpolatedAngle;
        }
    }

    createBodyGraphics() {
        if (this.bodyGraphics == null) {
            this.bodyGraphics = new PIXI.Graphics();
        } else {
            this.bodyGraphics.clear();
        }
        this.bodyGraphics.beginFill(0xffffff);
        this.bodyGraphics.alpha = 0.75;
        this.bodyGraphics.drawRect(this.body.interpolatedPosition[0] - (this.body.shapes[0] as p2.Box).width / 2,
            this.body.interpolatedPosition[1] - (this.body.shapes[0] as p2.Box).height / 2,
            (this.body.shapes[0] as p2.Box).width, (this.body.shapes[0] as p2.Box).height);

        return this.bodyGraphics;
    }

}
