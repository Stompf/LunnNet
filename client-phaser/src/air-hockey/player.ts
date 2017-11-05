import * as Phaser from 'phaser-ce';
import { KeyMapping } from './key-mapping';
import { Team, TeamSide } from './team';

export class Player {
    readonly RADIUS = 60;
    private SPEED = 600;

    private sprite: Phaser.Sprite;
    private keyMapping: KeyMapping.Mapping | null | undefined;
    private team: Team;

    constructor(game: Phaser.Game, team: Team, keyMapping?: KeyMapping.Mapping) {
        this.keyMapping = keyMapping;
        this.team = team;

        const graphics = new Phaser.Graphics(game);
        graphics.beginFill(team.Color);
        graphics.drawCircle(0, 0, this.RADIUS);

        const sprite = game.add.sprite(0, 0, graphics.generateTexture());
        game.physics.p2.enable(sprite);
        sprite.body.setCircle(this.RADIUS / 2);

        this.sprite = sprite;
    }

    setDebug(debug: boolean) {
        this.sprite.body.debug = debug;
    }

    setPosition(position: WebKitPoint) {
        this.sprite.body.x = position.x;
        this.sprite.body.y = position.y;
    }

    getPosition() {
        return this.sprite.position;
    }

    onUpdate(game: Phaser.Game) {
        if (this.keyMapping == null) {
            return;
        }

        // this.sprite.body.setZeroVelocity();

        let input = [0, 0];

        if (game.input.keyboard.isDown(this.keyMapping.up)) {
            input[1] += this.SPEED;
        }
        if (game.input.keyboard.isDown(this.keyMapping.down)) {
            input[1] -= this.SPEED;
        }
        if (game.input.keyboard.isDown(this.keyMapping.left)
            && (this.team.TeamSide !== TeamSide.Right || this.sprite.body.x > (game.width / 2 + this.RADIUS / 2))) {
            input[0] -= this.SPEED;
        }
        if (game.input.keyboard.isDown(this.keyMapping.right)
            && (this.team.TeamSide !== TeamSide.Left || this.sprite.body.x < (game.width / 2 - this.RADIUS / 2))) {
            input[0] += this.SPEED;
        }

        this.sprite.body.moveUp(input[1]);
        this.sprite.body.moveRight(input[0]);
    }
}

export class NetworkPlayer extends Player {

    constructor(game: Phaser.Game, team: Team) {
        super(game, team);
    }
}