import * as p2 from 'p2';

export class Ball {
    private color: number;
    private position: LunnEngine.Vector2D;

    private body: p2.Body;
    private bodyGraphics: PIXI.Graphics;

    constructor() {
        this.color = 0x000000;
        this.position = { x: 0, y: 0 };

        this.body = new p2.Body({
            mass: 0.5
        });
        this.body.damping = 0;
        this.body.angularDamping = 0;

        const shape = new p2.Box({
            height: 5,
            width: 5
        });
        this.createBodyGraphics();
        this.body.addShape(shape);
    }

    update() {
        if (this.bodyGraphics) {
            this.bodyGraphics.x = this.body.interpolatedPosition[0];
            this.bodyGraphics.y = this.body.interpolatedPosition[1];
            this.bodyGraphics.rotation = this.body.interpolatedAngle;
        }
    }

    private createBodyGraphics() {
        if (this.bodyGraphics == null) {
            this.bodyGraphics = new PIXI.Graphics();
        } else {
            this.bodyGraphics.clear();
        }
        this.bodyGraphics.beginFill(this.color);
        this.bodyGraphics.alpha = 1;
        this.bodyGraphics.drawRect(this.body.interpolatedPosition[0] - (this.body.shapes[0] as p2.Box).width / 2,
            this.body.interpolatedPosition[1] - (this.body.shapes[0] as p2.Box).height / 2,
            (this.body.shapes[0] as p2.Box).width, (this.body.shapes[0] as p2.Box).height);

        return this.bodyGraphics;
    }
}