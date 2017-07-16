import * as p2 from 'p2';
import { KeyboardStates } from '../../lunnEngine/utils/KeyboardStates';
import { KeyMapping } from './KeyMapping';

export class Player {
    private color: number;

    private body: p2.Body;
    bodyGraphics: PIXI.Graphics;

    private keyMapping: KeyMapping.Mapping;

    constructor(world: p2.World, keyMapping: KeyMapping.Mapping, color?: number) {
        this.keyMapping = keyMapping;
        this.color = color ? color : 0xAAAAAA;

        this.body = new p2.Body({
            mass: 1
        });
        this.body.damping = 0;
        this.body.angularDamping = 0;

        const shape = new p2.Box({
            height: 1,
            width: 1
        });

        this.body.previousPosition = [0, 0];
        this.body.position = [0, 0];
        this.body.addShape(shape);
        this.createBodyGraphics();

        world.addBody(this.body);
    }

    update(deltaTime: number) {
        this.handleInput(deltaTime);

        if (this.bodyGraphics) {
            this.bodyGraphics.x = this.body.position[0];
            this.bodyGraphics.y = this.body.position[1];
            this.bodyGraphics.rotation = this.body.interpolatedAngle;
        }
    }

    private handleInput(deltaTime: number) {
        var input = [0, 0];

        if (KeyboardStates.isKeyPressed(this.keyMapping.up)) {
            input[1] += 1;
        }
        if (KeyboardStates.isKeyPressed(this.keyMapping.down)) {
            input[1] -= 1;
        }
        if (KeyboardStates.isKeyPressed(this.keyMapping.left)) {
            input[0] -= 1;
        }
        if (KeyboardStates.isKeyPressed(this.keyMapping.right)) {
            input[0] += 1;
        }

        this.body.position = [this.body.position[0] + input[0], this.body.position[1] + input[1]];
    }

    private createBodyGraphics() {
        if (this.bodyGraphics == null) {
            this.bodyGraphics = new PIXI.Graphics();
        } else {
            this.bodyGraphics.clear();
        }
        this.bodyGraphics.beginFill(this.color);
        this.bodyGraphics.drawRect(this.body.interpolatedPosition[0] - (this.body.shapes[0] as p2.Box).width / 2,
            this.body.interpolatedPosition[1] - (this.body.shapes[0] as p2.Box).height / 2,
            (this.body.shapes[0] as p2.Box).width, (this.body.shapes[0] as p2.Box).height);

        return this.bodyGraphics;
    }
} 