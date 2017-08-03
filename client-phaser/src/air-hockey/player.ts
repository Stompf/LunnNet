import * as Phaser from 'phaser-ce';
import { KeyMapping } from './key-mapping';

export class Player {
    readonly RECT_SIZE = 60;
    private SPEED = 300;

    private sprite: Phaser.Sprite;
    private keyMapping: KeyMapping.Mapping;
    private color: number;
    private team: number;

    constructor(game: Phaser.Game, keyMapping: KeyMapping.Mapping, color: number, team: number) {
        this.keyMapping = keyMapping;
        this.color = color;
        this.team = team;

        const graphics = new Phaser.Graphics(game);
        graphics.beginFill(color);
        graphics.drawRect(0, 0, this.RECT_SIZE, this.RECT_SIZE);

        const sprite = game.add.sprite(0, 0, graphics.generateTexture());

        game.physics.p2.enable(sprite);
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
        this.sprite.body.setZeroVelocity();

        var input = [0, 0];

        if (game.input.keyboard.isDown(this.keyMapping.up)) {
            input[1] += this.SPEED;
        }
        if (game.input.keyboard.isDown(this.keyMapping.down)) {
            input[1] -= this.SPEED;
        }
        if (game.input.keyboard.isDown(this.keyMapping.left)) {
            input[0] -= this.SPEED;
        }
        if (game.input.keyboard.isDown(this.keyMapping.right)) {
            input[0] += this.SPEED;
        }

        this.sprite.body.moveUp(input[1]);

        if (this.sprite.body.x < (game.width / 2 - this.RECT_SIZE / 2){
        
            this.sprite.body.moveRight(input[0]);
        }
    }
}