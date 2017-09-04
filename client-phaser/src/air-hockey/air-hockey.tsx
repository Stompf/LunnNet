import * as React from 'react';
import { Player } from './player';
import { RouteComponentProps } from 'react-router-dom';
import { KeyMapping } from './key-mapping';
import * as Phaser from 'phaser-ce';
import { Ball } from './ball';
import { Team, TeamSide } from './team';

class AirHockey extends React.Component<RouteComponentProps<any>, {}> {
    private _game: Phaser.Game;
    private readonly CANVAS_ID = 'AirHockeyCanvas';
    private readonly TOP_OFFSET = 75;
    private readonly SCORE_DELAY_MS = 2000;
    private readonly BALL_INIT_VELOCITY = 10;
    private readonly DEBUG_BODIES = false;

    private _teamLeft: Team;
    private _teamRight: Team;
    private _player1: Player;
    private _player2: Player;
    private _ball: Ball;

    private _goal1: Phaser.Sprite;
    private _goal2: Phaser.Sprite;

    private _scoreText: Phaser.Text;

    constructor() {
        super();
    }

    render() {
        return (
            <div>
                <div id={this.CANVAS_ID} />
                <textarea id="AirHockeyTextarea" />
            </div>
        );
    }

    componentDidMount() {
        this._game = new Phaser.Game(1400, 600, Phaser.AUTO, this.CANVAS_ID, { preload: this.preload, create: this.create, update: this.update });
    }

    componentWillUnmount() {
        if (this._game) {
            this._game.destroy();
        }
    }

    private totalAreaHeight() {
        return this._game.height - this.TOP_OFFSET;
    }

    private preload = () => {
        // Assets
    }

    private create = () => {
        PIXI.Sprite.defaultAnchor = { x: 0.5, y: 0.5 };

        this._game.stage.backgroundColor = 0xFFFFFF;
        this._game.renderer.view.style.border = '1px solid black';
        this._game.physics.startSystem(Phaser.Physics.P2JS);
        this._game.physics.p2.world.gravity = [0, 0];
        this._game.physics.p2.restitution = 1;

        this._teamLeft = new Team(TeamSide.Left);
        this._teamRight = new Team(TeamSide.Right);

        this.drawStage();

        this._player1 = new Player(this._game, KeyMapping.Player1Mapping, this._teamLeft);
        this._player2 = new Player(this._game, KeyMapping.Player2Mapping, this._teamRight);
        this._ball = new Ball(this._game);

        this._player1.setDebug(this.DEBUG_BODIES);
        this._player2.setDebug(this.DEBUG_BODIES);
        this._ball.setDebug(this.DEBUG_BODIES);

        this.resetPositions();
    }

    private resetPositions() {
        this._player1.setPosition(new Phaser.Point(this._game.width / 4, this.TOP_OFFSET + this.totalAreaHeight() / 2));
        this._player2.setPosition(new Phaser.Point(this._game.width / 1.25 - this._player2.RADIUS, this.TOP_OFFSET + this.totalAreaHeight() / 2));
        this._ball.setPosition(new Phaser.Point(this._game.width / 2, this.TOP_OFFSET + this.totalAreaHeight() / 2));
    }

    private drawStage() {
        const topLine = new Phaser.Graphics(this._game);
        topLine.lineStyle(1, 0x000000);
        topLine.moveTo(0, 0);
        topLine.lineTo(this._game.width, 0);
        const topSprite = this._game.add.sprite(0, this.TOP_OFFSET, topLine.generateTexture());
        this._game.physics.p2.enable(topSprite);

        topSprite.body.setRectangle(this._game.width + 10, this.TOP_OFFSET, this._game.width / 2, -this.TOP_OFFSET / 2);
        topSprite.body.static = true;
        topSprite.anchor.x = 0;
        topSprite.body.debug = this.DEBUG_BODIES;

        const middleLine = new Phaser.Graphics(this._game);
        middleLine.beginFill(0xD3D3D3);
        middleLine.drawRect(0, 0, 5, this.totalAreaHeight());
        const middleSprite = this._game.add.sprite(this._game.width / 2, this.TOP_OFFSET, middleLine.generateTexture());
        middleSprite.anchor.y = 0;

        this._goal1 = this.drawGoal(this._teamLeft);
        this._goal2 = this.drawGoal(this._teamRight);

        this._scoreText = this._game.add.text(this._game.width / 2, this.TOP_OFFSET / 2, this._teamLeft.Score + ' - ' + this._teamRight.Score);
    }

    private drawGoal(team: Team) {
        const goalWidth = 20;
        const goalHeight = 125;
        const goalNetSize = 30;

        let x = this._game.width / 10;

        if (team.TeamSide === TeamSide.Right) {
            x = this._game.width - x;
        }

        const topAndBottomGraphics = new Phaser.Graphics(this._game);
        topAndBottomGraphics.beginFill(0xD3D3D3);
        topAndBottomGraphics.drawRect(0, 0, goalWidth, goalNetSize);
        const top = this._game.add.sprite(x, this.TOP_OFFSET + this.totalAreaHeight() / 2 - goalHeight / 2 - goalNetSize / 2, topAndBottomGraphics.generateTexture());
        const bottom = this._game.add.sprite(x, this.TOP_OFFSET + this.totalAreaHeight() / 2 + goalHeight / 2 + goalNetSize / 2, topAndBottomGraphics.generateTexture());

        const backGraphics = new Phaser.Graphics(this._game);
        backGraphics.beginFill(0xD3D3D3);
        backGraphics.drawRect(0, 0, goalNetSize, goalHeight + goalNetSize * 2);
        const offset = goalWidth / 2 + goalNetSize / 2;
        const back = this._game.add.sprite(x - (team.TeamSide === TeamSide.Left ? offset : -offset), this.TOP_OFFSET + this.totalAreaHeight() / 2, backGraphics.generateTexture());

        this._game.physics.p2.enable(top);
        this._game.physics.p2.enable(bottom);
        this._game.physics.p2.enable(back);

        top.body.static = true;
        bottom.body.static = true;
        back.body.static = true;

        top.body.debug = this.DEBUG_BODIES;
        bottom.body.debug = this.DEBUG_BODIES;
        back.body.debug = this.DEBUG_BODIES;

        const graphics = new Phaser.Graphics(this._game);
        graphics.beginFill(0x000000);
        graphics.drawRect(0, 0, goalWidth, goalHeight);

        const sprite = this._game.add.sprite(x, this.TOP_OFFSET + this.totalAreaHeight() / 2, graphics.generateTexture());
        return sprite;
    }

    private update = () => {
        this._ball.onUpdate();

        const ballPosition = this._ball.getPosition();
        if (this._goal1.getBounds().contains(ballPosition.x, ballPosition.y)) {
            this.score(this._teamRight);
        } else if (this._goal2.getBounds().contains(ballPosition.x, ballPosition.y)) {
            this.score(this._teamLeft);
        }

        this._player1.onUpdate(this._game);
        this._player2.onUpdate(this._game);
    }

    private score(team: Team) {
        this._ball.resetVelocity();
        team.addScore();
        this._scoreText.setText(this._teamLeft.Score + ' - ' + this._teamRight.Score, true);
        this._game.paused = true;

        setTimeout(() => {
            this.resetPositions();
            this._ball.resetVelocity(team === this._teamLeft ? -(this.BALL_INIT_VELOCITY) : this.BALL_INIT_VELOCITY);
            this._game.paused = false;
        }, this.SCORE_DELAY_MS);
    }
}

export default AirHockey;