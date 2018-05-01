import { BaseSprite } from './baseSprite';
import { KeyMapping } from './key-mapping';
import { P2Sprite } from 'src/models';
import { Game } from 'phaser-ce';
import { addMilliseconds, isAfter } from 'date-fns';
import { PlayerData } from '../models';
import { PLAYER_COLORS } from './config';

export const DEFAULT_PLAYER_OPTIONS: LunnNet.AchtungKurve.NewNetworkPlayer = {
    color: PLAYER_COLORS[0],
    diameter: 10,
    mass: 1,
    id: '',
    position: { x: 0, y: 0 },
    speed: 100,
    movement: 0
};

export class Player extends BaseSprite {
    score: number = 0;
    readonly isLocalPlayer: boolean;

    private readonly SPEED: number;
    private readonly movementSpeed: number = 0.05;
    private readonly id: string;
    private readonly diameter: number;

    private movement: number;
    private isAlive: boolean = true;

    constructor(
        game: Phaser.Game,
        options: LunnNet.AchtungKurve.NewNetworkPlayer,
        private keyMapping: KeyMapping.Mapping
    ) {
        super(Player.createSprite(game, options));
        this.isLocalPlayer = true;
        this.SPEED = options.speed;
        this.id = options.id;
        this.movement = options.movement;
        this.diameter = options.diameter;
        this.sprite.body.onBeginContact.add(this.onBeginContact, this);
    }

    static createSprite(game: Phaser.Game, options: LunnNet.AchtungKurve.NewNetworkPlayer) {
        Phaser.Component.Core.skipTypeChecks = true;

        const graphics = new Phaser.Graphics(game);
        graphics.beginFill(options.color);
        graphics.drawCircle(0, 0, options.diameter);

        const sprite = game.add.sprite(
            options.position.x,
            options.position.y,
            graphics.generateTexture()
        );
        game.physics.p2.enable(sprite);
        sprite.body.setCircle(options.diameter / 2);
        sprite.body.mass = options.mass;

        return sprite;
    }

    onUpdate(game: Phaser.Game) {
        if (!this.isLocalPlayer || !this.isAlive) {
            return;
        }

        if (game.input.keyboard.isDown(this.keyMapping.left)) {
            this.movement += this.movementSpeed;
        }
        if (game.input.keyboard.isDown(this.keyMapping.right)) {
            this.movement -= this.movementSpeed;
        }

        this.sprite.body.velocity.x = Math.cos(this.movement) * this.SPEED;
        this.sprite.body.velocity.y = Math.sin(this.movement) * this.SPEED;

        const sprite: P2Sprite = game.add.sprite(
            this.sprite.body.x,
            this.sprite.body.y,
            this.sprite.texture
        );
        game.physics.p2.enable(sprite);
        sprite.body.setCircle(this.diameter / 2);
        sprite.body.mass = this.sprite.body.mass;
        sprite.body.static = true;
        sprite.data = this.getSpriteData();
    }

    private getSpriteData(): PlayerData {
        return {
            activeTime: addMilliseconds(new Date(), 200),
            playerId: this.id
        };
    }

    private die() {
        this.isAlive = false;
        this.sprite.body.setZeroVelocity();
        this.sprite.body.static = true;
    }

    private onBeginContact(collideBody: Phaser.Physics.P2.Body | null) {
        if (collideBody && collideBody.sprite && this.checkCollision(collideBody.sprite.data)) {
            this.die();
        }
    }

    private checkCollision(collideSpriteData: PlayerData) {
        return (
            !collideSpriteData ||
            this.id !== collideSpriteData.playerId ||
            isAfter(new Date(), collideSpriteData.activeTime)
        );
    }
}
