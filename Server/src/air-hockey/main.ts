import { Player } from './player';
import { Ball } from './ball';
import * as p2 from 'p2';
import { TeamSide, Team } from './team';
import * as winston from 'winston';

export class AirHockey {
    private readonly SCORE_DELAY_MS = 2000;
    private readonly BALL_INIT_VELOCITY = 10;
    private readonly TOP_OFFSET = 75;

    private player1: Player;
    private player2: Player;
    private teamLeft: Team;
    private teamRight: Team;

    private ball: Ball;
    private goal1: LunnNet.Utils.Rectangle | undefined;
    private goal2: LunnNet.Utils.Rectangle | undefined;
    private tick = 0;
    private paused = false;

    private world: p2.World;
    private canvas = {
        width: 1400,
        height: 600
    };

    constructor(playerOneSocket: SocketIO.Socket, playerTwoSocket: SocketIO.Socket) {
        this.world = new p2.World({
            gravity: [0, 0]
        });

        this.teamLeft = new Team(TeamSide.Left);
        this.teamRight = new Team(TeamSide.Right);

        this.player1 = new Player(this.world, playerOneSocket, this.teamLeft, this.canvas.width);
        this.player2 = new Player(this.world, playerTwoSocket, this.teamRight, this.canvas.width);

        this.ball = new Ball(this.world);

        this.initSockets(this.player1);
        this.initSockets(this.player2);

        this.update();
    }

    sendStartGame() {
        winston.info('AirHockey, starting game with players: ' + this.player1.id + ' : ' + this.player2.id);
        this.player1.socket.emit('GameFound', {} as LunnNet.AirHockey.GameFound);
        this.player2.socket.emit('GameFound', {} as LunnNet.AirHockey.GameFound);
    }

    private resetWorld() {
        this.world.clear();
        this.setStage();
    }

    private initSockets(player: Player) {
        player.socket.on('ClientReady', (_data: LunnNet.AirHockey.ClientReady) => {
            winston.info('AirHockey - player is ready: ' + player.id);
            player.isReady = true;

            if (this.player1.isReady && this.player2.isReady) {
                winston.info('AirHockey - both players ready! Starting game!');
                this.startNewGame();
            }
        });
    }

    private update = () => {
        if (this.paused || !this.goal1 || !this.goal2) {
            return;
        }

        if (this.tick > Number.MAX_VALUE) {
            this.tick = 0;
        }

        this.tick++;

        this.ball.onUpdate();

        const ballPosition = this.ball.getPosition();
        if (this.pointInsideRect(ballPosition.x, ballPosition.y, this.goal1)) {
            this.score(this.teamRight);
        } else if (this.pointInsideRect(ballPosition.x, ballPosition.y, this.goal2)) {
            this.score(this.teamLeft);
        }

        this.player1.onUpdate();
        this.player2.onUpdate();
    }

    private score(team: Team) {
        this.ball.resetVelocity();
        team.addScore();
        this.paused = true;

        setTimeout(() => {
            this.setStartPositions();
            this.ball.resetVelocity(team === this.teamLeft ? -(this.BALL_INIT_VELOCITY) : this.BALL_INIT_VELOCITY);
            this.paused = false;
        }, this.SCORE_DELAY_MS);
    }

    private startNewGame() {
        this.tick = 0;
        this.resetWorld();
        this.setStartPositions();
    }

    private setStartPositions() {
        this.player1.setPosition({
            x: this.canvas.width / 4,
            y: this.TOP_OFFSET + this.totalAreaHeight() / 2
        });

        this.player2.setPosition({
            x: this.canvas.width / 1.25 - this.player2.DIAMETER,
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

    private setStage() {
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

        this.goal1 = this.drawGoal(this.player1.team);
        this.goal2 = this.drawGoal(this.player2.team);
    }

    private pointInsideRect(x: number, y: number, rect: LunnNet.Utils.Rectangle) {
        return rect.position[0] <= x && x <= rect.position[0] + rect.width &&
            rect.position[1] <= y && y <= rect.position[1] + rect.height;
    }

    private drawGoal(team: Team) {
        const goalWidth = 20;
        const goalHeight = 125;
        const goalNetSize = 30;

        let x = this.canvas.width / 10;

        if (team.TeamSide === TeamSide.Right) {
            x = this.canvas.width - x;
        }

        const top = new p2.Box({
            width: goalWidth,
            height: goalNetSize
        });
        top.position = [x, this.TOP_OFFSET + this.totalAreaHeight() / 2 - goalHeight / 2 - goalNetSize / 2];

        const bottom = new p2.Box({
            width: goalWidth,
            height: goalNetSize
        });
        bottom.position = [x, this.TOP_OFFSET + this.totalAreaHeight() / 2 + goalHeight / 2 + goalNetSize / 2];

        const back = new p2.Box({
            width: goalNetSize,
            height: goalNetSize + goalNetSize * 2
        });
        const offset = goalWidth / 2 + goalNetSize / 2;
        back.position = [x - (team.TeamSide === TeamSide.Left ? offset : -offset), this.TOP_OFFSET + this.totalAreaHeight() / 2];

        top.type = p2.Body.STATIC;
        back.type = p2.Body.STATIC;
        bottom.type = p2.Body.STATIC;

        return {
            width: goalWidth,
            height: goalHeight,
            position: [x, this.TOP_OFFSET + this.totalAreaHeight() / 2]
        } as LunnNet.Utils.Rectangle;
    }
}
