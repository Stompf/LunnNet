import * as Phaser from 'phaser-ce';
import { KeyMapping } from './key-mapping';
import { BaseSprite } from './baseSprite';

export const DEFAULT_PLAYER_OPTIONS: LunnNet.AirHockey.NewNetworkPlayer = {
    color: 0xff0000,
    diameter: 60,
    mass: 1,
    id: '',
    position: { x: 0, y: 0 },
    speed: 700
};

export class Player extends BaseSprite {
    id: string;
    DIAMETER: number;

    private SPEED = 700;
    readonly isLocalPlayer: boolean;
    private keyMapping: KeyMapping.Mapping;
    private input: number[] = [0, 0];

    constructor(
        game: Phaser.Game,
        isLocalPlayer: boolean,
        keyMapping: KeyMapping.Mapping,
        options: LunnNet.AirHockey.NewNetworkPlayer
    ) {
        super(Player.createSprite(game, options));

        this.id = options.id;
        this.SPEED = options.speed;
        this.DIAMETER = options.diameter;
        this.keyMapping = keyMapping;
        this.isLocalPlayer = isLocalPlayer;
    }

    onNetworkUpdate(data: LunnNet.AirHockey.UpdateNetworkPlayer) {
        // if (this.isLocalPlayer) {
        //     return;
        // }

        // console.log(`Update: ${data.angularForce} : ${data.angularVelocity} :
        // ${data.force[0]} : ${data.force[1]} : ${data.velocity[0]} : ${data.velocity[1]}`);

        // this.sprite.body.angularForce = data.angularForce;
        // this.sprite.body.angularVelocity = data.angularVelocity;
        // this.sprite.body.force.x = data.force[0];
        // this.sprite.body.force.y = data.force[1];
        // this.sprite.body.velocity.x = data.velocity[0];
        // this.sprite.body.velocity.y = data.velocity[1];

        this.sprite.body.x = data.position.x;
        this.sprite.body.y = data.position.y;
    }

    onLocalUpdate(game: Phaser.Game, clientMove?: boolean) {
        if (!this.isLocalPlayer) {
            return;
        }

        this.input = [0, 0];

        if (game.input.keyboard.isDown(this.keyMapping.up)) {
            this.input[1] -= this.SPEED;
        }
        if (game.input.keyboard.isDown(this.keyMapping.down)) {
            this.input[1] += this.SPEED;
        }
        if (game.input.keyboard.isDown(this.keyMapping.left)) {
            this.input[0] -= this.SPEED;
        }
        if (game.input.keyboard.isDown(this.keyMapping.right)) {
            this.input[0] += this.SPEED;
        }
        // if (game.input.keyboard.isDown(KeyMapping.PlayerMapping.left)
        //     && (this.team.TeamSide !== TeamSide.Right || this.sprite.body.x > (game.width / 2 + this.RADIUS / 2))) {
        //     input[0] -= this.SPEED;
        // }
        // if (game.input.keyboard.isDown(KeyMapping.PlayerMapping.right)
        //     && (this.team.TeamSide !== TeamSide.Left || this.sprite.body.x < (game.width / 2 - this.RADIUS / 2))) {
        //     input[0] += this.SPEED;
        // }

        if (clientMove) {
            this.sprite.body.moveUp(-this.input[1]);
            this.sprite.body.moveRight(this.input[0]);
        }
    }

    toUpdateNetworkPlayer(): LunnNet.AirHockey.UpdateFromClient {
        // console.log(`Update: ${this.sprite.body.angularForce} : ${this.sprite.body.angularVelocity} :
        // ${this.sprite.body.force.x} : ${this.sprite.body.force.y} : ${this.sprite.body.velocity.x} : ${this.sprite.body.velocity.y}`);

        return {
            velocityHorizontal: this.input[0],
            velocityVertical: this.input[1]
        };
    }

    static createSprite(game: Phaser.Game, options: LunnNet.AirHockey.NewNetworkPlayer) {
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
}
