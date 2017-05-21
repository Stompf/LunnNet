import * as p2 from 'p2';
// import * as PIXI from 'pixi.js';

export class Player {
    static SHIP = Math.pow(2, 1);

    size = 0.3
    visible: boolean;
    allowCollision: boolean;
    shape: p2.Circle;
    body: p2.Body;
    reloadTime = 0.1;
    turnSpeed = 4;
    lives = 3;
    lastShootTime = 0;

    constructor() {
    }

    init(world: p2.World, shipMask: number, asteroidMask: number) {
        this.visible = true;

        this.shape = new p2.Circle({
            radius: this.size,
            collisionGroup: shipMask,
            collisionMask: asteroidMask
        });
        this.body = new p2.Body({
            mass: 1
        });
        this.body.damping = 0;
        this.body.angularDamping = 0;

        this.body.addShape(this.shape);

        world.addBody(this.body);
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.visible) {
            const x = this.body.interpolatedPosition[0];
            const y = this.body.interpolatedPosition[1];
            const radius = this.shape.radius;
            ctx.save();
            ctx.translate(x, y);         // Translate to the ship center
            ctx.rotate(this.body.interpolatedAngle); // Rotate to ship orientation
            ctx.beginPath();
            ctx.moveTo(-radius * 0.6, -radius);
            ctx.lineTo(0, radius);
            ctx.lineTo(radius * 0.6, -radius);
            ctx.moveTo(-radius * 0.5, -radius * 0.5);
            ctx.lineTo(radius * 0.5, -radius * 0.5);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }
    }

}
