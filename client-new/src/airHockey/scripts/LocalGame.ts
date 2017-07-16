
import { Player } from './Player';
import * as p2 from 'p2';
import { BaseAirHockeyGame } from './BaseAirHockeyGame';
import { KeyMapping } from './KeyMapping';

export class LocalGame extends BaseAirHockeyGame {
    private player1: Player;
    private player2: Player;
    private world: p2.World;

    // private readonly maxSubSteps = 5; // Max physics ticks per render frame
    // private readonly fixedDeltaTime = 1 / 60; // Physics "tick" delta time
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

        this.player1 = new Player(this.world, KeyMapping.Player1_Mapping, 0xFF0000);
        this.player2 = new Player(this.world, KeyMapping.Player2_Mapping, 0x0000FF);

        this.initWorldEvents(this.world);

        this.initStage();
    }

    onUpdate(deltaTime: number) {
        this.updatePhysics(deltaTime);

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

        this.app.stage.removeChildren();
        this.container = new PIXI.Container();

        this.container.addChild(this.player1.bodyGraphics);
        this.container.addChild(this.player2.bodyGraphics);

        this.app.stage.addChild(this.container);
    }

    private updatePhysics(deltaTime: number) {
        // this.world.step(this.fixedDeltaTime, deltaTime, this.maxSubSteps);
    }

    private initWorldEvents(world: p2.World) {
        // Add ship physics
        world.on('postStep', () => {

        }, this);

        // Catch impacts in the world
        // Todo: check if several bullets hit the same asteroid in the same time step
        world.on('beginContact', (evt: p2.BeginContactEvent) => {

        }, this);
    }
}