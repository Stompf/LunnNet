
import { Player } from './Player';
import { Ball } from './Ball';
import * as p2 from 'p2';
import { BaseAirHockeyGame } from './BaseAirHockeyGame';
import { KeyMapping } from './KeyMapping';

export class LocalGame extends BaseAirHockeyGame {
    private player1: Player;
    private player2: Player;
    private ball: Ball;
    private middlePlaneGraphics: PIXI.Graphics;
    private world: p2.World;

    private readonly maxSubSteps = 5; // Max physics ticks per render frame
    private readonly fixedDeltaTime = 1 / 60; // Physics "tick" delta time
    private readonly spaceWidth = 16;
    private readonly spaceHeight = 9;

    initNewGame(app: PIXI.Application) {
        super.initNewGame(app);

        // Init physics world
        this.world = new p2.World({
            gravity: [0, 0]
        });

        // Turn off friction, we don't need it.
        this.world.defaultContactMaterial.friction = 0;
        this.addPlanes(this.world, 6, 8);

        this.ball = new Ball(this.world);

        this.player1 = new Player(this.world, KeyMapping.Player1_Mapping, 0xFF0000);
        this.player2 = new Player(this.world, KeyMapping.Player2_Mapping, 0x0000FF);

        this.ball.setPosition({ x: -1, y: 0 });
        this.player1.setPosition({ x: -2, y: 0 });
        this.player2.setPosition({ x: 2, y: 0 });

        this.initWorldEvents(this.world);

        this.initStage();
    }

    onUpdate(deltaTime: number) {
        this.updatePhysics(deltaTime);

        this.ball.update();
        this.player1.update(deltaTime);
        this.player2.update(deltaTime);

        this.app.renderer.render(this.app.stage);
    }

    private initStage() {
        this.app.stage.position.x = this.app.renderer.width / 2; // center at origin
        this.app.stage.position.y = this.app.renderer.height / 2;

        let zoom = this.app.renderer.height / this.spaceHeight;
        if (this.app.renderer.width / this.spaceWidth < zoom) {
            zoom = this.app.renderer.width / this.spaceWidth;
        }

        this.app.stage.scale.x = zoom;
        this.app.stage.scale.y = -zoom;

        const goalWidth = 0.25;
        const goalY = -1;
        const goal_1 = this.setGoal(this.world, { x: -6, y: goalY }, goalWidth);
        const goal_2 = this.setGoal(this.world, { x: 6, y: goalY }, goalWidth);

        this.app.stage.removeChildren();
        this.container = new PIXI.Container();

        this.container.addChild(this.middlePlaneGraphics);
        this.container.addChild(this.ball.graphics);
        this.container.addChild(this.player1.graphics);
        this.container.addChild(this.player2.graphics);
        this.container.addChild(goal_1);
        this.container.addChild(goal_2);

        this.app.stage.addChild(this.container);
    }

    private setGoal(world: p2.World, position: LunnEngine.Vector2D, width: number) {
        const body = new p2.Body();
        const box = new p2.Box({
            height: Math.abs(position.y * 2),
            width: width
        });
        body.position = [position.x + box.width / 2, position.y + box.height / 2];
        box.collisionGroup = Math.pow(2, AirHockey.MASKS.GOAL);
        box.collisionMask = Math.pow(2, AirHockey.MASKS.PLAYER) | Math.pow(2, AirHockey.MASKS.BALL);

        body.addShape(box);

        const graphics = new PIXI.Graphics();
        graphics.beginFill(0x000000);
        graphics.drawRect(position.x, position.y, box.width, box.height);
        world.addBody(body);
        return graphics;
    }

    private addPlanes(world: p2.World, height: number, width: number) {

        // Top plane
        const planeTop = new p2.Body({
            position: [0, height],
            angle: Math.PI
        });
        planeTop.addShape(new p2.Plane({
            collisionGroup: Math.pow(2, AirHockey.MASKS.PLANE),
            collisionMask: Math.pow(2, AirHockey.MASKS.PLAYER) | Math.pow(2, AirHockey.MASKS.BALL)
        }));
        world.addBody(planeTop);

        // Bottom plane
        const planeBottom = new p2.Body({
            position: [0, -height],
        });
        planeBottom.addShape(new p2.Plane({
            collisionGroup: Math.pow(2, AirHockey.MASKS.PLANE),
            collisionMask: Math.pow(2, AirHockey.MASKS.PLAYER) | Math.pow(2, AirHockey.MASKS.BALL)
        }));
        world.addBody(planeBottom);

        // Left plane
        const planeLeft = new p2.Body({
            angle: -Math.PI / 2,
            position: [-width, 0]
        });
        planeLeft.addShape(new p2.Plane({
            collisionGroup: Math.pow(2, AirHockey.MASKS.PLANE),
            collisionMask: Math.pow(2, AirHockey.MASKS.PLAYER) | Math.pow(2, AirHockey.MASKS.BALL)
        }));
        world.addBody(planeLeft);

        // Right plane
        const planeRight = new p2.Body({
            angle: Math.PI / 2,
            position: [width, 0]
        });
        planeRight.addShape(new p2.Plane({
            collisionGroup: Math.pow(2, AirHockey.MASKS.PLANE),
            collisionMask: Math.pow(2, AirHockey.MASKS.PLAYER) | Math.pow(2, AirHockey.MASKS.BALL)
        }));
        world.addBody(planeRight);

        // Middle
        const planeMiddle = new p2.Body({
            position: [0, 0],
        });
        const middleBox = new p2.Box({
            height: height * 2,
            width: 0.1
        });
        middleBox.collisionGroup = Math.pow(2, AirHockey.MASKS.MIDDLE_PLANE);
        middleBox.collisionMask = Math.pow(2, AirHockey.MASKS.PLAYER);
        planeMiddle.addShape(middleBox);
        world.addBody(planeMiddle);

        this.middlePlaneGraphics = new PIXI.Graphics();
        this.middlePlaneGraphics.beginFill(0xD3D3D3);
        this.middlePlaneGraphics.drawRect(planeMiddle.position[0] - middleBox.width / 2, -height, middleBox.width, middleBox.height);
    }

    private updatePhysics(deltaTime: number) {
        this.world.step(this.fixedDeltaTime, deltaTime, this.maxSubSteps);
    }

    private initWorldEvents(world: p2.World) {
        // Add ship physics
        world.on('postStep', () => {

            this.player1.postStep();
            this.player2.postStep();
        }, this);

        // Catch impacts in the world
        // Todo: check if several bullets hit the same asteroid in the same time step
        world.on('beginContact', (evt: p2.BeginContactEvent) => {

        }, this);
    }
}