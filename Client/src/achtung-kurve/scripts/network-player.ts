import { PlayerOptions } from '../models';
import { KeyMapping } from './key-mapping';

export class NetworkPlayer {
    readonly id: string;
    readonly isLocalPlayer: boolean;

    isAlive: boolean = true;

    private keyMapping: KeyMapping.Mapping | undefined;
    private movement: number = 0;
    private movementSpeed: number;
    private color: number;
    private diameter: number;

    graphics: Phaser.Graphics;

    constructor(game: Phaser.Game, options: PlayerOptions, keyMapping?: KeyMapping.Mapping) {
        this.keyMapping = keyMapping;
        this.id = options.id;
        this.movement = options.movement;
        this.isLocalPlayer = options.isLocalPlayer;
        this.movementSpeed = options.speed;
        this.color = options.color;
        this.diameter = options.diameter;

        this.graphics = game.add.graphics();
        this.graphics.moveTo(options.position.x, options.position.y);
    }

    onUpdate(game: Phaser.Game) {
        if (!this.isLocalPlayer || !this.isAlive || !this.keyMapping) {
            return;
        }

        const oldMovement = this.movement;
        if (game.input.keyboard.isDown(this.keyMapping.left)) {
            this.movement -= this.movementSpeed;
        }
        if (game.input.keyboard.isDown(this.keyMapping.right)) {
            this.movement += this.movementSpeed;
        }

        return oldMovement !== this.movement;
    }

    onNetworkUpdate(data: LunnNet.AchtungKurve.UpdatePlayer) {
        this.graphics.lineStyle(this.diameter, this.color);
        this.graphics.lineTo(data.positions[0].x, data.positions[0].y);
    }

    toUpdateFromClient(): LunnNet.AchtungKurve.UpdateFromClient {
        return {
            movement: this.movement
        };
    }
}
