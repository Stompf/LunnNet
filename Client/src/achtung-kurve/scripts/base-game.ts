import { IGameConfig } from 'phaser-ce';

export class BaseAchtungGame {
    protected game: Phaser.Game;

    constructor(canvasId: string) {
        const config = {
            canvasId,
            width: 1400,
            height: 600,
            renderer: Phaser.AUTO,
            antialias: true,
            state: {
                preload: () => this.preload(),
                create: () => this.create(),
                update: () => this.update()
            }
        } as IGameConfig;

        this.game = new Phaser.Game(config);
    }

    destroy() {
        this.game.destroy();
    }

    protected preload() {
        this.game.canvas.oncontextmenu = e => {
            e.preventDefault();
        };

        this.game.stage.backgroundColor = 0xffffff;
        this.game.renderer.view.style.border = '1px solid black';

        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    }

    protected create() {
        this.initPixi();
        this.initPhysics();
    }

    protected update() {
        // Empty in base
    }

    private initPixi() {
        PIXI.Sprite.defaultAnchor = { x: 0.5, y: 0.5 };
    }

    private initPhysics() {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
    }
}
