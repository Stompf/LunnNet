import * as p2 from 'p2';
// import * as PIXI from 'pixi.js';

export class Player {
    static SHIP = Math.pow(2, 1);

    // private size = 0.3
    visible: boolean;
    allowCollision: boolean;
    body: p2.Body;
    reloadTime = 0.1;
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

    init(world: p2.World, shipMask: number, asteroidMask: number) {
        this.visible = true;

        // this.shape = new p2.Circle({
        //     radius: this.size,
        //     collisionGroup: shipMask,
        //     collisionMask: asteroidMask
        // });

        const shape = new p2.Box({
            height: this.sprite.height,
            width: this.sprite.width
        });
        shape.collisionGroup = shipMask;
        shape.collisionMask = asteroidMask;

        this.body = new p2.Body({
            mass: 1
        });
        this.body.damping = 0;
        this.body.angularDamping = 0;

        this.body.addShape(shape);

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
        this.bodyGraphics = new PIXI.Graphics();
        this.bodyGraphics.beginFill(0xffffff);
        this.bodyGraphics.alpha = 0.75;
        // this.bodyGraphics.drawCircle(this.body.interpolatedPosition[0], this.body.interpolatedPosition[1], this.size);
        this.bodyGraphics.drawRect(this.body.interpolatedPosition[0] - (this.body.shapes[0] as p2.Box).width / 2,
            this.body.interpolatedPosition[1] - (this.body.shapes[0] as p2.Box).height / 2,
            (this.body.shapes[0] as p2.Box).width, (this.body.shapes[0] as p2.Box).height);

        return this.bodyGraphics;
    }

}
