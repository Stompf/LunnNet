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

    private queuedUpdates: LunnNet.AchtungKurve.UpdatePlayer[];

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
        this.queuedUpdates = [];
    }

    onUpdate(game: Phaser.Game) {
        this.readQueuedUpdates();

        if (!this.isLocalPlayer || !this.isAlive || !this.keyMapping) {
            return;
        }

        const oldMovement = this.movement;
        if (
            game.input.keyboard.isDown(this.keyMapping.left) ||
            (game.input.pointer1.isDown && game.input.pointer1.x <= game.width / 2)
        ) {
            this.movement -= this.movementSpeed;
        }
        if (
            game.input.keyboard.isDown(this.keyMapping.right) ||
            (game.input.pointer1.isDown && game.input.pointer1.x > game.canvas.width / 2)
        ) {
            this.movement += this.movementSpeed;
        }

        return oldMovement !== this.movement;
    }

    onNetworkUpdate(data: LunnNet.AchtungKurve.UpdatePlayer) {
        this.queuedUpdates.push(data);
    }

    toUpdateFromClient(): LunnNet.AchtungKurve.UpdateFromClient {
        return {
            movement: this.movement
        };
    }

    private readQueuedUpdates() {
        this.queuedUpdates.forEach(update => {
            this.graphics.lineStyle(this.diameter, this.color);
            this.graphics.lineTo(update.positions[0].x, update.positions[0].y);
        });
        this.queuedUpdates = [];
    }
}
