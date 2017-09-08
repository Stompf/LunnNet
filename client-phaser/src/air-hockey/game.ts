import * as Phaser from 'phaser-ce';
import * as socketIO from 'socket.io-client';

import { Ball } from './ball';
import { Team, TeamSide } from './team';
import { Player, NetworkPlayer } from './player';
import { KeyMapping } from './key-mapping';

export class BaseGame {

    protected game: Phaser.Game;

    private readonly SCORE_DELAY_MS = 2000;
    private readonly BALL_INIT_VELOCITY = 10;
    private readonly DEBUG_BODIES = false;
    private readonly TOP_OFFSET = 75;

    protected teamLeft: Team;
    protected teamRight: Team;
    protected player1: Player;
    protected player2: Player;
    protected ball: Ball;

    private goal1: Phaser.Sprite;
    private goal2: Phaser.Sprite;

    protected scoreText: Phaser.Text;

    constructor(canvasId: string) {
        this.game = new Phaser.Game(1400, 600, Phaser.AUTO, canvasId, { preload: this.preload, create: this.create, update: this.update });
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
        // Assets
    }

    protected initPixi() {
        PIXI.Sprite.defaultAnchor = { x: 0.5, y: 0.5 };

        this.game.stage.backgroundColor = 0xFFFFFF;
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

        this.player1 = new Player(this.game, this.teamLeft, KeyMapping.Player1Mapping);
        this.player2 = new Player(this.game, this.teamRight, KeyMapping.Player2Mapping);
        this.ball = new Ball(this.game);

        this.player1.setDebug(this.DEBUG_BODIES);
        this.player2.setDebug(this.DEBUG_BODIES);
        this.ball.setDebug(this.DEBUG_BODIES);

        this.resetPositions();
    }

    private resetPositions() {
        this.player1.setPosition({ x: this.game.width / 4, y: this.TOP_OFFSET + this.totalAreaHeight() / 2 });
        this.player2.setPosition({ x: this.game.width / 1.25 - this.player2.RADIUS, y: this.TOP_OFFSET + this.totalAreaHeight() / 2 });
        this.ball.setPosition({ x: this.game.width / 2, y: this.TOP_OFFSET + this.totalAreaHeight() / 2 });
    }

    protected drawStage() {
        const topLine = new Phaser.Graphics(this.game);
        topLine.lineStyle(1, 0x000000);
        topLine.moveTo(0, 0);
        topLine.lineTo(this.game.width, 0);
        const topSprite = this.game.add.sprite(0, this.TOP_OFFSET, topLine.generateTexture());
        this.game.physics.p2.enable(topSprite);

        topSprite.body.setRectangle(this.game.width + 10, this.TOP_OFFSET, this.game.width / 2, -this.TOP_OFFSET / 2);
        topSprite.body.static = true;
        topSprite.anchor.x = 0;
        topSprite.body.debug = this.DEBUG_BODIES;

        const middleLine = new Phaser.Graphics(this.game);
        middleLine.beginFill(0xD3D3D3);
        middleLine.drawRect(0, 0, 5, this.totalAreaHeight());
        const middleSprite = this.game.add.sprite(this.game.width / 2, this.TOP_OFFSET, middleLine.generateTexture());
        middleSprite.anchor.y = 0;

        this.goal1 = this.drawGoal(this.teamLeft);
        this.goal2 = this.drawGoal(this.teamRight);

        this.scoreText = this.game.add.text(this.game.width / 2, this.TOP_OFFSET / 2, this.teamLeft.Score + ' - ' + this.teamRight.Score);
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
        topAndBottomGraphics.beginFill(0xD3D3D3);
        topAndBottomGraphics.drawRect(0, 0, goalWidth, goalNetSize);
        const top = this.game.add.sprite(x, this.TOP_OFFSET + this.totalAreaHeight() / 2 - goalHeight / 2 - goalNetSize / 2, topAndBottomGraphics.generateTexture());
        const bottom = this.game.add.sprite(x, this.TOP_OFFSET + this.totalAreaHeight() / 2 + goalHeight / 2 + goalNetSize / 2, topAndBottomGraphics.generateTexture());

        const backGraphics = new Phaser.Graphics(this.game);
        backGraphics.beginFill(0xD3D3D3);
        backGraphics.drawRect(0, 0, goalNetSize, goalHeight + goalNetSize * 2);
        const offset = goalWidth / 2 + goalNetSize / 2;
        const back = this.game.add.sprite(x - (team.TeamSide === TeamSide.Left ? offset : -offset), this.TOP_OFFSET + this.totalAreaHeight() / 2, backGraphics.generateTexture());

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

        const sprite = this.game.add.sprite(x, this.TOP_OFFSET + this.totalAreaHeight() / 2, graphics.generateTexture());
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

        this.player1.onUpdate(this.game);
        this.player2.onUpdate(this.game);
    }

    private score(team: Team) {
        this.ball.resetVelocity();
        team.addScore();
        this.scoreText.setText(this.teamLeft.Score + ' - ' + this.teamRight.Score, true);
        this.game.paused = true;

        setTimeout(() => {
            this.resetPositions();
            this.ball.resetVelocity(team === this.teamLeft ? -(this.BALL_INIT_VELOCITY) : this.BALL_INIT_VELOCITY);
            this.game.paused = false;
        }, this.SCORE_DELAY_MS);
    }
}

export class NetworkGame extends BaseGame {
    private socket: SocketIOClient.Socket;
    private serverIP = 'http://localhost:4444';
    private gameFound = false;
    private currentTick = 0;

    constructor(canvasId: string) {
        super(canvasId);

        this.connect();
    }

    destroy() {
        this.disconnect();
        super.destroy();
    }

    protected create = () => {
        this.initPixi();
    }

    protected update = () => {
        if (!this.gameFound) {
            return;
        }
        this.player1.onUpdate(this.game);
    }

    private initNewNetworkGame() {
        this.currentTick = 0;
        this.teamLeft = new Team(TeamSide.Left);
        this.teamRight = new Team(TeamSide.Right);

        this.player1 = new Player(this.game, this.teamLeft, KeyMapping.Player1Mapping);
        this.player2 = new NetworkPlayer(this.game, this.teamRight);

        this.drawStage();

        this.sendClientReady();
        this.gameFound = true;
    }

    private connect() {
        this.socket = socketIO(this.serverIP);
        this.socket.on('connect', () => {
            this.appendTextareaLine('Connected');
            this.queue();
        });

        this.socket.on('GameFound', (_data: LunnNet.AirHockey.GameFound) => {
            this.appendTextareaLine('GameFound');
            this.initNewNetworkGame();
        });

        this.socket.on('disconnect', () => {
            this.appendTextareaLine('Disconnected');
        });

        this.socket.on('ServerTick', (data: LunnNet.AirHockey.ServerTick) => {
            if (data == null || data.tick < this.currentTick) {
                return; // Old data
            }

            this.ball.setPosition({ x: data.ballPos[0], y: data.ballPos[1] });
        });
    }

    private disconnect() {
        if (this.socket != null) {
            this.socket.emit('RemoveFromMatchMaking', {} as LunnNet.Network.RemoveFromMatchMaking);
            this.socket.close();
        }
    }

    private queue() {
        this.socket.emit('QueueMatchMaking', { game: LunnNet.Game.AirHockey } as LunnNet.Network.QueueMatchMaking);
        this.appendTextareaLine('Looking for game...');
    }

    private sendClientReady() {
        this.socket.emit('ClientReady', {} as LunnNet.AirHockey.ClientReady);
        this.appendTextareaLine('ClientReady!');
    }
}