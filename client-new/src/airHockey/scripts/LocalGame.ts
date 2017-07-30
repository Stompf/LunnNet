
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

    private readonly WIDTH = 1600;
    private readonly HEIGHT = 600;

    private readonly maxSubSteps = 5; // Max physics ticks per render frame
    private readonly fixedDeltaTime = 1 / 60; // Physics "tick" delta time
    private readonly spaceWidth = 16;
    private readonly spaceHeight = 9;

    private goal1Rect: PIXI.Rectangle;
    private goal2Rect: PIXI.Rectangle;

    initNewGame(app: PIXI.Application) {
        super.initNewGame(app);

        this.app.view.width = this.WIDTH;
        this.app.view.height = this.HEIGHT;
        this.app.renderer.resize(this.WIDTH, this.HEIGHT);

        // Init physics world
        this.world = new p2.World({
            gravity: [0, 0]
        });

        // Turn off friction, we don't need it.
        this.world.defaultContactMaterial.friction = 0;
        this.addPlanes(this.world, 4.5, 12);

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

        this.goal1Rect = new PIXI.Rectangle(-9, goalY, goalWidth, Math.abs(goalY * 2));
        this.goal2Rect = new PIXI.Rectangle(9, goalY, goalWidth, Math.abs(goalY * 2));

        this.app.stage.removeChildren();
        this.container = new PIXI.Container();

        this.container.addChild(this.middlePlaneGraphics);
        this.container.addChild(this.ball.graphics);
        this.container.addChild(this.player1.graphics);
        this.container.addChild(this.player2.graphics);

        this.setGoal(this.world, this.goal1Rect, this.container);
        this.setGoal(this.world, this.goal2Rect, this.container);

        this.app.stage.addChild(this.container);
    }

    private setGoal(world: p2.World, rect: PIXI.Rectangle, container: PIXI.Container) {
        // BACK
        const bodyBack = new p2.Body();
        const boxBack = new p2.Box({
            height: rect.height,
            width: rect.width / 2
        });
        bodyBack.position = [rect.x + boxBack.width * 2, rect.y + boxBack.height / 2];
        boxBack.collisionGroup = Math.pow(2, AirHockey.MASKS.GOAL);
        boxBack.collisionMask = Math.pow(2, AirHockey.MASKS.PLAYER) | Math.pow(2, AirHockey.MASKS.BALL);

        bodyBack.addShape(boxBack);
        world.addBody(bodyBack);

        const goalBack = new PIXI.Graphics();
        goalBack.beginFill(0xAAAAAA);
        goalBack.drawRect(bodyBack.position[0], rect.y, boxBack.width, boxBack.height);
        this.container.addChild(goalBack);

        // TOP
        const bodyTop = new p2.Body();
        const boxTop = new p2.Box({
            height: rect.width / 2,
            width: rect.width + (rect.width / 2)
        });
        bodyTop.position = [rect.x, rect.y + rect.height];
        boxTop.collisionGroup = Math.pow(2, AirHockey.MASKS.GOAL);
        boxTop.collisionMask = Math.pow(2, AirHockey.MASKS.PLAYER) | Math.pow(2, AirHockey.MASKS.BALL);

        bodyTop.addShape(boxTop);
        world.addBody(bodyTop);

        const goalTop = new PIXI.Graphics();
        goalTop.beginFill(0xAAAAAA);
        goalTop.drawRect(bodyTop.position[0], rect.y + rect.height, boxTop.width, boxTop.height);
        this.container.addChild(goalTop);

        // BOTTOM
        const bodyBottom = new p2.Body();
        const boxBottom = new p2.Box({
            height: rect.width / 2,
            width: rect.width + (rect.width / 2)
        });
        bodyBottom.position = [rect.x, rect.y - boxBottom.height];
        boxBottom.collisionGroup = Math.pow(2, AirHockey.MASKS.GOAL);
        boxBottom.collisionMask = Math.pow(2, AirHockey.MASKS.PLAYER) | Math.pow(2, AirHockey.MASKS.BALL);

        bodyBottom.addShape(boxBottom);
        world.addBody(bodyBottom);

        const goalBottom = new PIXI.Graphics();
        goalBottom.beginFill(0xAAAAAA);
        goalBottom.drawRect(bodyBottom.position[0], rect.y - boxBottom.height, boxBottom.width, boxBottom.height);
        this.container.addChild(goalBottom);

        // GOAL
        const goalGraphics = new PIXI.Graphics();
        goalGraphics.beginFill(0x000000);
        goalGraphics.drawRect(rect.x, rect.y, rect.width, rect.height);
        this.container.addChild(goalGraphics);
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
        world.on('postStep', () => {
            this.player1.postStep();
            this.player2.postStep();

            const ballPosition = this.ball.getPosition();
            if (this.goal1Rect.contains(ballPosition.x, ballPosition.y)) {
                this.appendTextareaLine('GOAL 1');
            } else if (this.goal2Rect.contains(ballPosition.x, ballPosition.y)) {
                this.appendTextareaLine('GOAL 2');
            }
        }, this);

        world.on('beginContact', (evt: p2.BeginContactEvent) => {

        }, this);
    }
}