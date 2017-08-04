import * as Phaser from 'phaser-ce';
import { KeyMapping } from './key-mapping';

export const enum Team {
    Left,
    Right
}

export class Player {
    readonly RADIUS = 60;
    private SPEED = 600;

    private sprite: Phaser.Sprite;
    private keyMapping: KeyMapping.Mapping;
    private color: number;
    private team: Team;

    constructor(game: Phaser.Game, keyMapping: KeyMapping.Mapping, color: number, team: Team) {
        this.keyMapping = keyMapping;
        this.color = color;
        this.team = team;

        const graphics = new Phaser.Graphics(game);
        graphics.beginFill(color);
        graphics.drawCircle(0, 0, this.RADIUS);

        const sprite = game.add.sprite(0, 0, graphics.generateTexture());
        game.physics.p2.enable(sprite);
        sprite.body.setCircle(this.RADIUS / 2);
        this.sprite = sprite;
    }

    setPosition(position: Phaser.Point) {
        this.sprite.body.x = position.x;
        this.sprite.body.y = position.y;
    }

    getPosition() {
        return this.sprite.position;
    }

    onUpdate(game: Phaser.Game) {
        // this.sprite.body.setZeroVelocity();

        var input = [0, 0];

        if (game.input.keyboard.isDown(this.keyMapping.up)) {
            input[1] += this.SPEED;
        }
        if (game.input.keyboard.isDown(this.keyMapping.down)) {
            input[1] -= this.SPEED;
        }
        if (game.input.keyboard.isDown(this.keyMapping.left)
            && (this.team !== Team.Right || this.sprite.body.x > (game.width / 2 + this.RADIUS / 2))) {
            input[0] -= this.SPEED;
        }
        if (game.input.keyboard.isDown(this.keyMapping.right)
            && (this.team !== Team.Left || this.sprite.body.x < (game.width / 2 - this.RADIUS / 2))) {
            input[0] += this.SPEED;
        }

        this.sprite.body.moveUp(input[1]);
        this.sprite.body.moveRight(input[0]);
    }
}