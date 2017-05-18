import * as p2 from 'p2';
// import * as PIXI from 'pixi.js';

export class Player {
    size = 0.3
    visible: boolean;
    allowCollision: boolean;
    shape: p2.Circle;
    body: p2.Body;
    reloadTime = 0.1;
    turnSpeed = 4;
    lives = 3;
    lastShootTime = 0;

    bulletBodies: Asteroids.Bullet[] = [];
    bulletShape: p2.Circle;
    bulletRadius = 0.03;
    bulletLifeTime = 2;

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

}
