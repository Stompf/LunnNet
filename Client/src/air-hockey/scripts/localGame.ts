import { Team, TeamSide } from './team';
import { Player, DEFAULT_PLAYER_OPTIONS } from './player';
import { Ball } from './ball';
import { KeyMapping } from './key-mapping';

export class LocalAirHockeyGame {
    protected game: Phaser.Game;

    private readonly SCORE_DELAY_MS = 2000;
    private readonly BALL_INIT_VELOCITY = 10;
    private readonly DEBUG_BODIES = false;
    private readonly TOP_OFFSET = 75;

    protected teamLeft!: Team;
    protected teamRight!: Team;
    protected player1!: Player;
    protected player2!: Player;
    protected ball!: Ball;

    private goal1!: Phaser.Sprite;
    private goal2!: Phaser.Sprite;

    protected scoreText!: Phaser.Text;

    constructor(canvasId: string) {
        this.game = new Phaser.Game(1400, 600, Phaser.AUTO, canvasId, {
            preload: this.preload,
            create: this.create,
            update: this.update
        });
    }

    destroy() {
        this.game.destroy();
    }

    protected appendTextareaLine(text: string) {
        const textarea = document.getElementById('AirHockeyTextarea') as HTMLTextAreaElement;
        if (textarea != null) {
            textarea.value = text + '\n' + textarea.value;
        }
    }

    private totalAreaHeight() {
        return this.game.height - this.TOP_OFFSET;
    }

    private preload = () => {
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    };

    protected initPixi() {
        PIXI.Sprite.defaultAnchor = { x: 0.5, y: 0.5 };

        this.game.stage.backgroundColor = 0xffffff;
        this.game.renderer.view.style.border = '1px solid black';
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.world.gravity = [0, 0];
        this.game.physics.p2.restitution = 1;
    }

    protected create = () => {
        this.initPixi();

        this.teamLeft = new Team(TeamSide.Left);
        this.teamRight = new Team(TeamSide.Right);

        this.drawStage();

        const player1Options = {
            ...DEFAULT_PLAYER_OPTIONS,
            color: 0xff0000
        };

        const player2Options = {
            ...DEFAULT_PLAYER_OPTIONS,
            color: 0x0000ff
        };

        this.player1 = new Player(this.game, true, KeyMapping.Player1Mapping, player1Options);
        this.player2 = new Player(this.game, true, KeyMapping.Player2Mapping, player2Options);
        this.ball = new Ball(this.game);

        this.player1.setDebug(this.DEBUG_BODIES);
        this.player2.setDebug(this.DEBUG_BODIES);
        this.ball.setDebug(this.DEBUG_BODIES);

        this.resetPositions();
    };

    private resetPositions() {
        this.player1.setPosition({
            x: this.game.width / 4,
            y: this.TOP_OFFSET + this.totalAreaHeight() / 2
        });
        this.player2.setPosition({
            x: this.game.width / 1.25 - this.player2.DIAMETER,
            y: this.TOP_OFFSET + this.totalAreaHeight() / 2
        });
        this.ball.setPosition({
            x: this.game.width / 2,
            y: this.TOP_OFFSET + this.totalAreaHeight() / 2
        });
    }

    protected drawStage() {
        const topLine = new Phaser.Graphics(this.game);
        topLine.lineStyle(1, 0x000000);
        topLine.moveTo(0, 0);
        topLine.lineTo(this.game.width, 0);
        const topSprite = this.game.add.sprite(0, this.TOP_OFFSET, topLine.generateTexture());
        this.game.physics.p2.enable(topSprite);

        topSprite.body.setRectangle(
            this.game.width + 10,
            this.TOP_OFFSET,
            this.game.width / 2,
            -this.TOP_OFFSET / 2
        );
        topSprite.body.static = true;
        topSprite.anchor.x = 0;
        topSprite.body.debug = this.DEBUG_BODIES;

        const middleLine = new Phaser.Graphics(this.game);
        middleLine.beginFill(0xd3d3d3);
        middleLine.drawRect(0, 0, 5, this.totalAreaHeight());
        const middleSprite = this.game.add.sprite(
            this.game.width / 2,
            this.TOP_OFFSET,
            middleLine.generateTexture()
        );
        middleSprite.anchor.y = 0;

        this.goal1 = this.drawGoal(this.teamLeft);
        this.goal2 = this.drawGoal(this.teamRight);

        this.scoreText = this.game.add.text(
            this.game.width / 2,
            this.TOP_OFFSET / 2,
            this.teamLeft.score + ' - ' + this.teamRight.score
        );
    }

    private drawGoal(team: Team) {
        const goalWidth = 20;
        const goalHeight = 125;
        const goalNetSize = 30;

        let x = this.game.width / 10;

        if (team.TeamSide === TeamSide.Right) {
            x = this.game.width - x;
        }

        const topAndBottomGraphics = new Phaser.Graphics(this.game);
        topAndBottomGraphics.beginFill(0xd3d3d3);
        topAndBottomGraphics.drawRect(0, 0, goalWidth, goalNetSize);
        const top = this.game.add.sprite(
            x,
            this.TOP_OFFSET + this.totalAreaHeight() / 2 - goalHeight / 2 - goalNetSize / 2,
            topAndBottomGraphics.generateTexture()
        );
        const bottom = this.game.add.sprite(
            x,
            this.TOP_OFFSET + this.totalAreaHeight() / 2 + goalHeight / 2 + goalNetSize / 2,
            topAndBottomGraphics.generateTexture()
        );

        const backGraphics = new Phaser.Graphics(this.game);
        backGraphics.beginFill(0xd3d3d3);
        backGraphics.drawRect(0, 0, goalNetSize, goalHeight + goalNetSize * 2);
        const offset = goalWidth / 2 + goalNetSize / 2;
        const back = this.game.add.sprite(
            x - (team.TeamSide === TeamSide.Left ? offset : -offset),
            this.TOP_OFFSET + this.totalAreaHeight() / 2,
            backGraphics.generateTexture()
        );

        this.game.physics.p2.enable(top);
        this.game.physics.p2.enable(bottom);
        this.game.physics.p2.enable(back);

        top.body.static = true;
        bottom.body.static = true;
        back.body.static = true;

        top.body.debug = this.DEBUG_BODIES;
        bottom.body.debug = this.DEBUG_BODIES;
        back.body.debug = this.DEBUG_BODIES;

        const graphics = new Phaser.Graphics(this.game);
        graphics.beginFill(0x000000);
        graphics.drawRect(0, 0, goalWidth, goalHeight);

        const sprite = this.game.add.sprite(
            x,
            this.TOP_OFFSET + this.totalAreaHeight() / 2,
            graphics.generateTexture()
        );
        return sprite;
    }

    protected update = () => {
        this.ball.onUpdate();

        const ballPosition = this.ball.getPosition();
        if (this.goal1.getBounds().contains(ballPosition.x, ballPosition.y)) {
            this.score(this.teamRight);
        } else if (this.goal2.getBounds().contains(ballPosition.x, ballPosition.y)) {
            this.score(this.teamLeft);
        }

        this.player1.onLocalUpdate(this.game, true);
        this.player2.onLocalUpdate(this.game, true);
    };

    private score(team: Team) {
        this.ball.resetVelocity();
        team.score++;
        this.scoreText.setText(this.teamLeft.score + ' - ' + this.teamRight.score, true);
        this.game.paused = true;

        setTimeout(() => {
            this.resetPositions();
            this.ball.resetVelocity(
                team === this.teamLeft ? -this.BALL_INIT_VELOCITY : this.BALL_INIT_VELOCITY
            );
            this.game.paused = false;
        }, this.SCORE_DELAY_MS);
    }
}
