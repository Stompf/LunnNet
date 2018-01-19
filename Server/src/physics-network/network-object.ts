import * as p2 from 'p2';

export class NetworkObject {

    body: p2.Body;

    private diameter = 10;

    constructor(world: p2.World, position: WebKitPoint) {
        this.body = new p2.Body({
            mass: 0.1
        });
        this.body.addShape(new p2.Circle({ radius: this.diameter / 2 }));
        this.body.position = [position.x, position.y];
        this.body.previousPosition = this.body.position;

        world.addBody(this.body);
    }
}