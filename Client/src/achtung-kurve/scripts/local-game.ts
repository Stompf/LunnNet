import { Player, DEFAULT_PLAYER_OPTIONS } from './player';
import { KeyMapping } from './key-mapping';
import { PLAYER_COLORS } from './config';
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
}
