import * as p2 from 'p2';

export class Ball {
    private color: number;
    private position: LunnEngine.Vector2D;

    private body: p2.Body;
    graphics: PIXI.Graphics;

    constructor(world: p2.World) {
        this.color = 0x000000;
        this.position = { x: 0, y: 0 };

        this.body = new p2.Body({
            mass: 0.001,
        });

        this.body.damping = -0.2;
        this.body.angularDamping = -0.2;

        const shape = new p2.Circle({
            radius: 0.25,
            collisionGroup: Math.pow(2, AirHockey.MASKS.BALL),
            collisionMask: Math.pow(2, AirHockey.MASKS.PLAYER) | Math.pow(2, AirHockey.MASKS.PLANE) | Math.pow(2, AirHockey.MASKS.BALL) | Math.pow(2, AirHockey.MASKS.GOAL)
        });
        this.body.addShape(shape);
        this.createBodyGraphics();

        world.addBody(this.body);
    }

    setPosition(position: LunnEngine.Vector2D) {
        this.body.position = [position.x, position.y];
    }

    getPosition() {
        return { x: this.body.interpolatedPosition[0], y: this.body.interpolatedPosition[1] } as LunnEngine.Vector2D;
    }

    update() {
        if (this.graphics) {
            this.graphics.x = this.body.interpolatedPosition[0];
            this.graphics.y = this.body.interpolatedPosition[1];
            this.graphics.rotation = this.body.interpolatedAngle;
        }
    }

    private createBodyGraphics() {
        if (this.graphics == null) {
            this.graphics = new PIXI.Graphics();
        } else {
            this.graphics.clear();
        }
        this.graphics.beginFill(this.color);
        this.graphics.alpha = 1;
        this.graphics.drawCircle(this.body.interpolatedPosition[0], this.body.interpolatedPosition[1], (this.body.shapes[0] as p2.Circle).radius);
        return this.graphics;
    }
}