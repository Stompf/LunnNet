import { PlayerOptions } from '../models';
import { KeyMapping } from './key-mapping';

export class NetworkPlayer {
    readonly id: string;
    readonly isLocalPlayer: boolean;

    isAlive: boolean = true;

    private keyMapping: KeyMapping.Mapping | undefined;
    private movement: number = 0;
    private movementSpeed: number;

    graphics: Phaser.Graphics;

    constructor(game: Phaser.Game, options: PlayerOptions, keyMapping?: KeyMapping.Mapping) {
        this.id = options.id;
        this.movement = options.movement;
        this.isLocalPlayer = options.isLocalPlayer;
        this.keyMapping = keyMapping;
        this.movementSpeed = options.speed;
        this.graphics = game.add.graphics();
        this.graphics.moveTo(options.position.x, options.position.y);
        this.graphics.lineStyle(3, 0xff0000);
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
        this.graphics.lineStyle(3, 0xff0000);
        this.graphics.lineTo(data.positions[0].x, data.positions[0].y);
    }

    toUpdateFromClient(): LunnNet.AchtungKurve.UpdateFromClient {
        return {
            movement: this.movement
        };
    }
}
