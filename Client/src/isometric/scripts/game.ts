import { Player } from './player';

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
        this.game.stage.backgroundColor = 0xffffff;
        this.game.renderer.view.style.border = '1px solid black';

        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.load.spritesheet(
            'steel_armor',
            process.env.PUBLIC_URL + '/assets/games/isometric/character/male/steel_armor.png',
            128,
            128
        );
    };

    private create = () => {
        this.player = new Player(this.game);
    };

    private update = () => {
        this.player.update(this.game);
    };
}
