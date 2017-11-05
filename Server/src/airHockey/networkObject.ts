import * as p2 from 'p2';

export abstract class NetworkObject {
    body: p2.Body;

    protected world: p2.World;

    constructor(world: p2.World) {
        this.world = world;
        this.body = new p2.Body({
            mass: 0.1
        });
        world.addBody(this.body);
    }

    setPosition(position: WebKitPoint) {
        this.body.position[0] = position.x;
        this.body.position[1] = position.y;
    }

    getPosition() {
        return {
            x: this.body.position[0],
            y: this.body.position[1]
        };
    }

    abstract onUpdate(): void;
}
