export class AchtungGame {
    protected game: Phaser.Game;

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
    };

    private create = () => {
        // TODO
    };

    private update = () => {
        // TODO
    };
}
