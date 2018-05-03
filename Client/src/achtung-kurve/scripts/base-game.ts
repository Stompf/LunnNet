import { Player, DEFAULT_PLAYER_OPTIONS } from './player';
import { KeyMapping } from './key-mapping';
import { PLAYER_COLORS } from './config';

export class BaseAchtungGame {
    protected game: Phaser.Game;
    protected players: Player[] = [];

    constructor(canvasId: string) {
        this.game = new Phaser.Game(1400, 600, Phaser.AUTO, canvasId, {
            preload: () => this.preload(),
            create: () => this.create(),
            update: () => this.update()
        });
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
        this.initP2();
    }

    protected update() {
        // Empty in base
    }

    private initPixi() {
        PIXI.Sprite.defaultAnchor = { x: 0.5, y: 0.5 };
    }

    private initP2() {
        this.game.physics.startSystem(Phaser.Physics.P2JS);
    }
}
