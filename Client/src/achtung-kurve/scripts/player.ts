import { BaseSprite } from './base-sprite';
import { KeyMapping } from './key-mapping';
import { ArcadeSprite } from 'src/models';
import { addMilliseconds, isAfter } from 'date-fns';
import { PlayerData } from '../models';
import { PLAYER_COLORS } from './config';
import { Group } from 'phaser-ce';

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
    private historyGroup: Group;
    private closeHistoryGroup: Group;

    readonly isLocalPlayer: boolean;

    private readonly SPEED: number;
    private readonly movementSpeed: number = 0.05;
    private readonly id: string;
    private readonly diameter: number;

    private movement: number;
    isAlive: boolean = true;

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
        this.historyGroup = new Phaser.Group(game);
        this.closeHistoryGroup = new Phaser.Group(game);
    }

    static createSprite(game: Phaser.Game, options: LunnNet.AchtungKurve.NewNetworkPlayer) {
        Phaser.Component.Core.skipTypeChecks = true;

        const graphics = new Phaser.Graphics(game);
        graphics.beginFill(options.color);
        graphics.drawCircle(0, 0, options.diameter);

        const sprite: ArcadeSprite = game.add.sprite(
            options.position.x,
            options.position.y,
            graphics.generateTexture()
        );
        game.physics.arcade.enable(sprite);
        sprite.body.setCircle(options.diameter / 2);
        sprite.body.mass = options.mass;
        sprite.body.collideWorldBounds = true;
        sprite.body.isCircle = true;

        return sprite;
    }

    setPosition(position: WebKitPoint) {
        this.historyGroup.removeAll();
        this.closeHistoryGroup.removeAll();

        super.setPosition(position);
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

        const sprite: ArcadeSprite = game.add.sprite(
            this.sprite.x,
            this.sprite.y,
            this.sprite.texture
        );
        game.physics.arcade.enable(sprite);
        sprite.body.setCircle(this.diameter / 2);
        sprite.body.mass = this.sprite.body.mass;
        sprite.body.immovable = true;
        sprite.body.isCircle = true;

        this.closeHistoryGroup.add(sprite);

        sprite.data = this.getSpriteData();

        this.moveSprites();
    }

    private moveSprites() {
        const date = new Date();
        const moved: ArcadeSprite[] = [];
        this.closeHistoryGroup.forEach((child: ArcadeSprite) => {
            if (isAfter(date, child.data.activeTime)) {
                this.historyGroup.add(child);
                moved.push(child);
            }
        });

        moved.forEach(move => this.closeHistoryGroup.removeChild(move));
    }

    private getSpriteData(): PlayerData {
        return {
            activeTime: addMilliseconds(new Date(), 500),
            playerId: this.id
        };
    }

    getHistoryGroup() {
        return this.historyGroup;
    }

    getCloseHistoryGroup() {
        return this.closeHistoryGroup;
    }

    die() {
        this.isAlive = false;
        this.resetVelocity();
    }
}
