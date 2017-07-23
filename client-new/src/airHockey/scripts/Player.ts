import * as p2 from 'p2';
import { KeyboardStates } from '../../lunnEngine/utils/KeyboardStates';
import { KeyMapping } from './KeyMapping';

export class Player {
    private SPEED = 8;

    private color: number;

    private body: p2.Body;
    graphics: PIXI.Graphics;

    private keyMapping: KeyMapping.Mapping;

    constructor(world: p2.World, keyMapping: KeyMapping.Mapping, color?: number) {
        this.keyMapping = keyMapping;
        this.color = color ? color : 0xAAAAAA;

        this.body = new p2.Body({
            mass: 10
        });
        this.body.damping = 0;
        this.body.angularDamping = 0;

        const shape = new p2.Box({
            height: 1,
            width: 1
        });
        shape.collisionGroup = Math.pow(2, AirHockey.MASKS.PLAYER);
        shape.collisionMask = Math.pow(2, AirHockey.MASKS.BALL) | Math.pow(2, AirHockey.MASKS.MIDDLE_PLANE) | Math.pow(2, AirHockey.MASKS.PLANE) | Math.pow(2, AirHockey.MASKS.PLAYER);

        this.body.previousPosition = [0, 0];
        this.body.position = [0, 0];
        this.body.addShape(shape);
        this.createBodyGraphics();

        world.addBody(this.body);
    }

    setPosition(point: LunnEngine.Vector2D) {
        this.body.position = [point.x, point.y];
    }

    update(deltaTime: number) {
        if (this.graphics) {
            this.graphics.x = this.body.interpolatedPosition[0];
            this.graphics.y = this.body.interpolatedPosition[1];
            this.graphics.rotation = this.body.interpolatedAngle;
        }
    }

    postStep() {
        var input = [0, 0];

        if (KeyboardStates.isKeyPressed(this.keyMapping.up)) {
            input[1] += this.SPEED;
        }
        if (KeyboardStates.isKeyPressed(this.keyMapping.down)) {
            input[1] -= this.SPEED;
        }
        if (KeyboardStates.isKeyPressed(this.keyMapping.left)) {
            input[0] -= this.SPEED;
        }
        if (KeyboardStates.isKeyPressed(this.keyMapping.right)) {
            input[0] += this.SPEED;
        }

        this.body.velocity = input;
    }

    private createBodyGraphics() {
        if (this.graphics == null) {
            this.graphics = new PIXI.Graphics();
        } else {
            this.graphics.clear();
        }
        this.graphics.beginFill(this.color);
        this.graphics.drawRect(this.body.interpolatedPosition[0] - (this.body.shapes[0] as p2.Box).width / 2,
            this.body.interpolatedPosition[1] - (this.body.shapes[0] as p2.Box).height / 2,
            (this.body.shapes[0] as p2.Box).width, (this.body.shapes[0] as p2.Box).height);

        return this.graphics;
    }
} 