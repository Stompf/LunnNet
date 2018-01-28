import * as Phaser from 'phaser-ce';
import { KeyMapping } from './key-mapping';

export class Player {

    id: string;
    sprite: Phaser.Sprite;

    private SPEED = 700;
    readonly isLocalPlayer: boolean;

    constructor(game: Phaser.Game, isLocalPlayer: boolean, options: LunnNet.PhysicsNetwork.NewNetworkPlayer) {
        this.id = options.id;
        this.sprite = this.createSprite(game, options);

        this.isLocalPlayer = isLocalPlayer;
    }

    onNetworkUpdate(data: LunnNet.PhysicsNetwork.UpdateNetworkPlayer) {
        if (this.isLocalPlayer) {
            return;
        }

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

    onLocalUpdate(game: Phaser.Game) {
        if (!this.isLocalPlayer) {
            return;
        }

        let input = [0, 0];

        if (game.input.keyboard.isDown(KeyMapping.PlayerMapping.up)) {
            input[1] += this.SPEED;
        }
        if (game.input.keyboard.isDown(KeyMapping.PlayerMapping.down)) {
            input[1] -= this.SPEED;
        }
        if (game.input.keyboard.isDown(KeyMapping.PlayerMapping.left)) {
            input[0] -= this.SPEED;
        }
        if (game.input.keyboard.isDown(KeyMapping.PlayerMapping.right)) {
            input[0] += this.SPEED;
        }
        // if (game.input.keyboard.isDown(KeyMapping.PlayerMapping.left)
        //     && (this.team.TeamSide !== TeamSide.Right || this.sprite.body.x > (game.width / 2 + this.RADIUS / 2))) {
        //     input[0] -= this.SPEED;
        // }
        // if (game.input.keyboard.isDown(KeyMapping.PlayerMapping.right)
        //     && (this.team.TeamSide !== TeamSide.Left || this.sprite.body.x < (game.width / 2 - this.RADIUS / 2))) {
        //     input[0] += this.SPEED;
        // }

        this.sprite.body.moveUp(input[1]);
        this.sprite.body.moveRight(input[0]);
    }

    toUpdateNetworkPlayer(): LunnNet.PhysicsNetwork.UpdateNetworkPlayer {
        // console.log(`Update: ${this.sprite.body.angularForce} : ${this.sprite.body.angularVelocity} :
        // ${this.sprite.body.force.x} : ${this.sprite.body.force.y} : ${this.sprite.body.velocity.x} : ${this.sprite.body.velocity.y}`);

        return {
            id: this.id,
            position: { x: this.sprite.body.x, y: this.sprite.body.y }
        };
    }

    private createSprite(game: Phaser.Game, options: LunnNet.PhysicsNetwork.NewNetworkPlayer) {
        const graphics = new Phaser.Graphics(game);
        graphics.beginFill(options.color);
        graphics.drawCircle(0, 0, options.diameter);

        const sprite = game.add.sprite(options.position.x, options.position.y, graphics.generateTexture());
        game.physics.p2.enable(sprite);
        sprite.body.setCircle(options.diameter / 2);
        sprite.body.mass = 10;

        return sprite;
    }
}