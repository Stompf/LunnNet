import { Player } from './player';
import { KeyMapping } from './key-mapping';
import { PLAYER_COLORS, DEFAULT_PLAYER_OPTIONS } from './config';
import { BaseAchtungGame } from './base-game';

export class LocalAchtungGame extends BaseAchtungGame {
    protected players: Player[] = [];

    constructor(canvasId: string) {
        super(canvasId);
    }

    protected create() {
        super.create();
        this.initPlayers();
    }

    protected update() {
        this.updatePlayers();
        this.checkCollisions();
    }

    private initPlayers() {
        const player1 = new Player(
            this.game,
            {
                ...DEFAULT_PLAYER_OPTIONS,
                color: PLAYER_COLORS[0],
                id: 'player1',
                movement: this.getRandomMovement()
            },
            KeyMapping.Player1Mapping
        );
        player1.setPosition({ x: this.game.world.centerX / 2, y: this.game.world.centerY });

        const player2 = new Player(
            this.game,
            {
                ...DEFAULT_PLAYER_OPTIONS,
                color: PLAYER_COLORS[1],
                id: 'player2',
                movement: this.getRandomMovement()
            },
            KeyMapping.Player2Mapping
        );
        player2.setPosition({
            x: this.game.world.centerX + this.game.world.centerX / 2,
            y: this.game.world.centerY
        });

        this.players = [player1, player2];
    }

    private getRandomMovement() {
        return Math.random() * 2 * Math.PI;
    }

    private updatePlayers() {
        this.players.forEach(player => player.onUpdate(this.game));
    }

    private checkCollisions() {
        this.players.filter(p => p.isAlive).forEach(player => {
            if (this.checkPlayerCollide(player)) {
                player.die();
            }
        });
    }

    private checkPlayerCollide(player: Player) {
        return (
            player.checkWorldBounds() ||
            this.players.some(player2 => {
                return (
                    (player2 !== player && player.checkCollide(player2.getCloseHistoryGroup())) ||
                    player.checkCollide(player2.getHistoryGroup())
                );
            })
        );
    }
}
