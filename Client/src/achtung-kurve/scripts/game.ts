import { Player, DEFAULT_PLAYER_OPTIONS } from './player';

export class AchtungGame {
    protected game: Phaser.Game;

    private players: Player[] = [];

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
        this.game.canvas.oncontextmenu = e => {
            e.preventDefault();
        };

        this.game.stage.backgroundColor = 0xffffff;
        this.game.renderer.view.style.border = '1px solid black';

        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    };

    private create = () => {
        this.initPixi();
        this.initP2();
        this.initPlayers();
    };

    private update = () => {
        this.updatePlayers();
    };

    private initPixi() {
        PIXI.Sprite.defaultAnchor = { x: 0.5, y: 0.5 };
    }

    private initP2() {
        this.game.physics.startSystem(Phaser.Physics.P2JS);
    }

    private initPlayers() {
        const player = new Player(this.game, DEFAULT_PLAYER_OPTIONS);
        player.setPosition({ x: this.game.world.centerX, y: this.game.world.centerY });
        this.players = [player];
    }

    private updatePlayers() {
        this.players.forEach(player => player.onUpdate(this.game));
    }
}
