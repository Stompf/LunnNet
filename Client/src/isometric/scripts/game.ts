import { Player } from './player';
import { AssetLoader } from './asset-loader';

export class IsometricGame {
    protected game: Phaser.Game;

    player!: Player;
    cursors!: Phaser.CursorKeys;

    constructor(canvasId: string) {
        this.game = new Phaser.Game(1400, 600, Phaser.AUTO, canvasId, {
            preload: this.preload,
            create: this.create,
            update: this.update
        });
    }

    destroy() {
        this.game.destroy();
    }

    private preload = () => {
        PIXI.Sprite.defaultAnchor = { x: 0.5, y: 0.5 };
        this.game.canvas.oncontextmenu = e => {
            e.preventDefault();
        };

        this.game.stage.backgroundColor = 0xffffff;
        this.game.renderer.view.style.border = '1px solid black';

        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        AssetLoader.load(this.game);
    };

    private create = () => {
        this.player = new Player(this.game);
    };

    private update = () => {
        this.player.update(this.game);
    };
}
