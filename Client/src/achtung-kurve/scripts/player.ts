import { BaseSprite } from './baseSprite';
import { KeyMapping } from './key-mapping';
import { P2Sprite } from 'src/models';

export const DEFAULT_PLAYER_OPTIONS: LunnNet.AchtungKurve.NewNetworkPlayer = {
    color: 0xff0000,
    diameter: 10,
    mass: 1,
    id: '',
    position: { x: 0, y: 0 },
    speed: 100
};

export class Player extends BaseSprite {
    readonly isLocalPlayer: boolean;
    private readonly SPEED: number;
    private readonly movementSpeed: number = 0.05;

    private keyMapping: KeyMapping.Mapping;
    private movement: number = 0;

    constructor(game: Phaser.Game, options: LunnNet.AchtungKurve.NewNetworkPlayer) {
        super(Player.createSprite(game, options));
        this.isLocalPlayer = true;
        this.SPEED = options.speed;
        this.keyMapping = KeyMapping.Player1Mapping;
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
        if (!this.isLocalPlayer) {
            return;
        }

        // this.input = [0, 0];

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
        sprite.body.setCircle(10 / 2);
        sprite.body.mass = 1;
        sprite.body.static = true;
    }

    private onBeginContact = () => {
        console.log('onBeginContact');
    };
}
