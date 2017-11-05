import { Player } from './player';
import { Ball } from './ball';
import * as p2 from 'p2';
import { TeamSide, Team } from 'src/airHockey/team';

export class AirHockey {
    private readonly SCORE_DELAY_MS = 2000;
    private readonly BALL_INIT_VELOCITY = 10;
    private readonly TOP_OFFSET = 75;

    private playerOne: Player;
    private playerTwo: Player;
    private ball: Ball;

    private world: p2.World;
    private canvas = {
        width: 1400,
        height: 600
    };

    constructor(playerOneSocket: SocketIO.Socket, playerTwoSocket: SocketIO.Socket) {
        this.world = new p2.World({
            gravity: [0, 0]
        });

        this.playerOne = new Player(this.world, playerOneSocket, new Team(TeamSide.Left), this.canvas.width);
        this.playerTwo = new Player(this.world, playerTwoSocket, new Team(TeamSide.Right), this.canvas.width);

        this.ball = new Ball(this.world);

        this.initSockets(this.playerOne);
        this.initSockets(this.playerTwo);
    }

    sendStartGame() {
        console.log('AirHockey, starting game with players: ' + this.playerOne.id + ' : ' + this.playerTwo.id);
        this.playerOne.socket.emit('GameFound', {} as LunnNet.AirHockey.GameFound);
        this.playerTwo.socket.emit('GameFound', {} as LunnNet.AirHockey.GameFound);
    }

    private resetWorld() {
        this.world.clear();
    }

    private initSockets(player: Player) {
        player.socket.on('ClientReady', (_data: LunnNet.AirHockey.ClientReady) => {
            console.log('AirHockey - player is ready: ' + player.id);
            player.isReady = true;

            if (this.playerOne.isReady && this.playerTwo.isReady) {
                console.log('AirHockey - both players ready! Starting game!');
                this.startNewGame();
            }
        });
    }

    private startNewGame() {
        this.resetWorld();
        this.setStartPositions();
    }

    private setStartPositions() {
        this.playerOne.setPosition({
            x: this.canvas.width / 4,
            y: this.TOP_OFFSET + this.totalAreaHeight() / 2
        });

        this.playerTwo.setPosition({
            x: this.canvas.width / 1.25 - this.playerTwo.DIAMETER,
            y: this.TOP_OFFSET + this.totalAreaHeight() / 2
        });

        this.ball.setPosition({
            x: this.canvas.width / 2,
            y: this.TOP_OFFSET + this.totalAreaHeight() / 2
        });
    }

    private totalAreaHeight() {
        return this.canvas.height - this.TOP_OFFSET;
    }

    protected drawStage() {
        const topBody = new p2.Body({
            position: [0, this.TOP_OFFSET]
        });

        // topBody.setRectangle(this.game.width + 10, this.TOP_OFFSET, this.game.width / 2, -this.TOP_OFFSET / 2);
        topBody.type = p2.Body.STATIC;
        // topBody..anchor.x = 0;

        const topBodyShape = new p2.Box({
            width: this.canvas.width + 10,
            height: this.TOP_OFFSET
        });

        topBody.addShape(topBodyShape);
        this.world.addBody(topBody);

        this.goal1 = this.drawGoal(this.playerOne.team);
        this.goal2 = this.drawGoal(this.playerTwo.team);
    }

    private drawGoal(team: Team) {
        const goalWidth = 20;
        const goalHeight = 125;
        const goalNetSize = 30;

        let x = this.canvas.width / 10;

        if (team.TeamSide === TeamSide.Right) {
            x = this.canvas.width - x;
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

        top.body.static = true;
        bottom.body.static = true;
        back.body.static = true;

        const graphics = new Phaser.Graphics(this.game);
        graphics.beginFill(0x000000);
        graphics.drawRect(0, 0, goalWidth, goalHeight);

        const sprite = this.game.add.sprite(x, this.TOP_OFFSET + this.totalAreaHeight() / 2, graphics.generateTexture());
        return sprite;
    }
}
