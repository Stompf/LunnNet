import { Player } from './player';
import { logger } from '../logger';
import * as p2 from 'p2';
import { Ball } from './ball';
import { Team, TeamSide } from './team';
import { Socket } from 'socket.io';

export class AirHockey implements LunnNet.NetworkGame {
    readonly GAME_NAME = 'AirHockey';

    private readonly TIME_LIMIT = 10 * 60 * 1000;
    private readonly FIXED_TIME_STEP = 1 / 60;
    private readonly MAX_SUB_STEPS = 5;
    private readonly BALL_INIT_VELOCITY = 10;
    private readonly SCORE_DELAY_MS = 2000;
    private intervalReference: NodeJS.Timer | undefined;
    private timeLimitReference: NodeJS.Timer | undefined;
    private tick = 0;
    private gameStated: boolean;
    private paused = false;

    private players: Player[];
    private world: p2.World;
    private ball: Ball;
    private teamLeft: Team;
    private teamRight: Team;
    private goals: Goal[];

    private readonly GAME_SIZE: Readonly<LunnNet.Utils.Size> = { width: 1200, height: 600 };

    constructor(player1Socket: Socket, player2Socket: Socket) {
        this.gameStated = false;
        this.teamLeft = new Team(TeamSide.Left);
        this.teamRight = new Team(TeamSide.Right);
        this.world = new p2.World({ gravity: [0, 0] });
        this.world.defaultContactMaterial.restitution = 1;
        this.world.defaultContactMaterial.friction = 0;
        this.addWorldBounds(this.world);

        const player1 = new Player(this.world, player1Socket, 0xff0000, this.teamRight);
        const player2 = new Player(this.world, player2Socket, 0x0000ff, this.teamLeft);
        this.players = [player1, player2];
        this.ball = new Ball(this.world);
        this.resetPositions();

        const goal1 = this.addGoals(this.teamLeft);
        const goal2 = this.addGoals(this.teamRight);
        this.goals = [goal1, goal2];

        this.listenToEvents(player1Socket);
        this.listenToEvents(player2Socket);
        this.onBeginContact(this.world);
    }

    sendStartGame() {
        const gameFound: LunnNet.AirHockey.GameFound = {
            physicsOptions: {
                gravity: this.world.gravity,
                restitution: this.world.defaultContactMaterial.restitution
            },
            players: this.players.map(p => p.toNewNetworkPlayer()),
            gameSize: this.GAME_SIZE,
            ball: {
                color: Ball.COLOR,
                diameter: Ball.DIAMETER,
                mass: Ball.MASS,
                maxVelocity: Ball.MAX_VELOCITY
            },
            goals: this.goals.map(this.mapToGoalOptions)
        };

        logger.info(
            `${this.GAME_NAME} - starting game with players: ${this.players
                .map(p => p.socket.id)
                .join(' : ')}.`
        );

        this.emitToPlayers('GameFound', gameFound);

        this.intervalReference = setInterval(this.heartbeat, this.FIXED_TIME_STEP);
        this.gameStated = true;

        this.setTimeLimit();
    }

    stopGame = (forced?: boolean) => {
        logger.info(
            `${this.GAME_NAME} - stopping game with players: ${this.players
                .map(p => p.socket.id)
                .join(' : ')}.${forced === true ? ' forced' : ''}`
        );

        this.gameStated = false;

        if (this.intervalReference) {
            clearInterval(this.intervalReference);
        }

        this.world.clear();

        this.players.forEach(p => {
            if (p.socket.connected) {
                p.socket.disconnect(true);
            }
        });

        if (this.timeLimitReference) {
            clearTimeout(this.timeLimitReference);
        }
    };

    private setTimeLimit() {
        this.timeLimitReference = setTimeout(() => {
            this.stopGame(true);
        }, this.TIME_LIMIT);
    }

    private resetPositions(scoreTeam?: Team) {
        this.players[0].setPosition({
            x: this.GAME_SIZE.width / 1.25 - Player.DIAMETER,
            y: this.GAME_SIZE.height / 2
        });

        this.players[1].setPosition({
            x: this.GAME_SIZE.width / 4,
            y: this.GAME_SIZE.height / 2
        });

        this.ball.setPosition({
            x: this.GAME_SIZE.width / 2,
            y: this.GAME_SIZE.height / 2
        });

        if (scoreTeam) {
            this.ball.resetVelocity(
                scoreTeam === this.teamRight ? this.BALL_INIT_VELOCITY : -this.BALL_INIT_VELOCITY
            );
        }
    }

    private mapToGoalOptions = (goal: Goal): LunnNet.AirHockey.GoalOptions => {
        return {
            back: this.mapToPositionWithBox(goal.back),
            bottom: this.mapToPositionWithBox(goal.bottom),
            goal: this.mapToPositionWithBox(goal.goal),
            top: this.mapToPositionWithBox(goal.top)
        };
    };

    private mapToPositionWithBox(body: p2.Body): LunnNet.AirHockey.PositionWithBox {
        const box = body.shapes[0] as p2.Box;
        return {
            height: box.height,
            width: box.width,
            x: body.position[0],
            y: body.position[1]
        };
    }

    private emitToPlayers(event: string, data?: any) {
        this.players.forEach(p => {
            if (p.socket.connected) {
                p.socket.emit(event, data);
            }
        });
    }

    private heartbeat = () => {
        this.tick++;

        if (!this.paused) {
            this.ball.onUpdate();
            this.world.step(this.FIXED_TIME_STEP, this.FIXED_TIME_STEP, this.MAX_SUB_STEPS);
        }

        const serverTick: LunnNet.AirHockey.ServerTick = {
            tick: this.tick,
            players: this.players.map(p => p.toUpdateNetworkPlayerPlayer()),
            ballUpdate: this.ball.toBallUpdate()
        };

        // winston.info(`heartbeat: ${serverTick.players[0].velocity}`);

        this.emitToPlayers('ServerTick', serverTick);
    };

    private onBeginContact(world: p2.World) {
        world.on(
            'beginContact',
            (evt: typeof world.beginContactEvent) => {
                let team: Team | null = null;
                if (evt.bodyA === this.goals[0].goal || evt.bodyB === this.goals[0].goal) {
                    team = this.teamRight;
                } else if (evt.bodyA === this.goals[1].goal || evt.bodyB === this.goals[1].goal) {
                    team = this.teamLeft;
                }

                if (
                    team != null &&
                    (evt.bodyA === this.ball.body || evt.bodyB === this.ball.body)
                ) {
                    this.paused = true;
                    logger.info(`${team.TeamSide} GOAL!`);
                    team.addScore();

                    const newGoal: LunnNet.AirHockey.NewGoal = {
                        teamThatScored: team.TeamSide === TeamSide.Left ? 'left' : 'right',
                        teamLeftScore: this.teamLeft.Score,
                        teamRightScore: this.teamRight.Score,
                        timeout: this.SCORE_DELAY_MS
                    };
                    this.emitToPlayers('NewGoal', newGoal);

                    setTimeout(() => {
                        this.resetPositions(team!);
                        this.paused = false;
                    }, this.SCORE_DELAY_MS);
                }
            },
            this
        );

        // this.world.on('impact', () => {
        //     winston.info(`impact: ${this.ball.body.velocity[0]} : ${this.ball.body.velocity[1]}`);
        // }, this);

        // this.world.on('endContact', () => {
        //     winston.info(`endContact: ${this.ball.body.velocity[0]} : ${this.ball.body.velocity[1]} : ${this.ball.body.angularVelocity} `);

        //     this.ballTick++;
        //     const ballUpdate = this.ball.toBallUpdate(this.ballTick);

        //     this.player1.socket.emit('BallUpdate', ballUpdate);
        //     this.player2.socket.emit('BallUpdate', ballUpdate);
        // }, this);
    }

    private listenToEvents(socket: Socket) {
        socket.on('UpdateFromClient', (data: LunnNet.AirHockey.UpdateFromClient) => {
            this.handleOnPlayerUpdate(socket.id, data);
        });
        socket.on('disconnect', this.stopGame);
    }

    private handleOnPlayerUpdate = (id: string, data: LunnNet.AirHockey.UpdateFromClient) => {
        if (!this.gameStated) {
            return;
        }

        const player = this.players.find(p => p.socket.id === id);
        if (!player) {
            logger.info(
                `${this.GAME_NAME} - handleOnPlayerUpdate - got info about player not in game.`
            );
            return;
        }

        player.moveRight(data.velocityHorizontal);
        player.moveUp(data.velocityVertical);

        // winston.info(`handleOnPlayerUpdate: ${player.socket.id} : ${data.velocityHorizontal}`);
    };

    private addWorldBounds(world: p2.World) {
        let floor = new p2.Body({
            position: [0, 0]
        });
        floor.addShape(new p2.Plane());
        world.addBody(floor);

        let ceiling = new p2.Body({
            angle: Math.PI,
            position: [0, this.GAME_SIZE.height]
        });
        ceiling.addShape(new p2.Plane());
        world.addBody(ceiling);

        let right = new p2.Body({
            angle: Math.PI / 2,
            position: [this.GAME_SIZE.width, 0]
        });
        right.addShape(new p2.Plane());
        world.addBody(right);

        let left = new p2.Body({
            angle: 3 * Math.PI / 2,
            position: [0, 0]
        });
        left.addShape(new p2.Plane());
        world.addBody(left);
    }

    private addGoals(team: Team) {
        const goalWidth = 20;
        const goalHeight = 125;
        const goalNetSize = 30;

        let x = this.GAME_SIZE.width / 10;
        if (team.TeamSide === TeamSide.Right) {
            x = this.GAME_SIZE.width - x;
        }

        const top = new p2.Body();
        top.addShape(
            new p2.Box({
                height: goalNetSize,
                width: goalWidth
            })
        );
        top.position = [x, this.GAME_SIZE.height / 2 - goalHeight / 2 - goalNetSize / 2];

        const bottom = new p2.Body();
        bottom.addShape(
            new p2.Box({
                height: goalNetSize,
                width: goalWidth
            })
        );
        bottom.position = [x, this.GAME_SIZE.height / 2 + goalHeight / 2 + goalNetSize / 2];

        const back = new p2.Body();
        back.addShape(
            new p2.Box({
                height: goalHeight + goalNetSize * 2,
                width: goalNetSize
            })
        );
        const offset = goalWidth / 2 + goalNetSize / 2;
        back.position = [
            x - (team.TeamSide === TeamSide.Left ? offset : -offset),
            this.GAME_SIZE.height / 2
        ];

        this.world.addBody(top);
        this.world.addBody(bottom);
        this.world.addBody(back);

        top.type = p2.Body.STATIC;
        bottom.type = p2.Body.STATIC;
        back.type = p2.Body.STATIC;

        const goal = new p2.Body();
        goal.addShape(
            new p2.Box({
                height: goalHeight,
                width: goalWidth
            })
        );
        goal.position = [x, this.GAME_SIZE.height / 2, this.GAME_SIZE.height / 22];
        goal.type = p2.Body.STATIC;
        this.world.addBody(goal);

        return {
            back: back,
            bottom: bottom,
            top: top,
            goal: goal
        };
    }
}

interface Goal {
    back: p2.Body;
    bottom: p2.Body;
    top: p2.Body;
    goal: p2.Body;
}
