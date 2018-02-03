import { Player } from './player';
import * as winston from 'winston';
import * as p2 from 'p2';
import { Ball } from './ball';

export class PhysicsNetwork {

    private readonly FIXED_TIME_STEP = 1 / 60;
    private readonly MAX_SUB_STEPS = 10;
    private intervalReference: NodeJS.Timer;
    private tick = 0;
    private ballTick = 0;
    private gameStated: boolean;

    private player1: Player;
    private player2: Player;
    private world: p2.World;
    private ball: Ball;

    private readonly GAME_SIZE: Readonly<LunnNet.Utils.Size> = { width: 1200, height: 600 };

    constructor(player1Socket: SocketIO.Socket, player2Socket: SocketIO.Socket) {
        this.gameStated = false;
        this.world = new p2.World({ gravity: [0, 0] });
        this.world.defaultContactMaterial.restitution = 1;
        this.addWorldBounds(this.world);

        this.player1 = new Player(this.world, player1Socket, 0xFF0000, { x: this.GAME_SIZE.width / 1.25 - Player.DIAMETER, y: this.GAME_SIZE.height / 2 });
        this.player2 = new Player(this.world, player2Socket, 0x0000FF, { x: this.GAME_SIZE.width / 4, y: this.GAME_SIZE.height / 2 });
        this.ball = new Ball(this.world, { x: this.GAME_SIZE.width / 2, y: this.GAME_SIZE.height / 2 });

        this.listenToEvents(player1Socket);
        this.listenToEvents(player2Socket);
        this.onBeginContact();
    }

    sendStartGame() {
        const gameFound: LunnNet.PhysicsNetwork.GameFound = {
            physicsOptions: {
                gravity: this.world.gravity,
                restitution: this.world.defaultContactMaterial.restitution
            },
            players: [
                this.player1.toNewNetworkPlayer(),
                this.player2.toNewNetworkPlayer()
            ],
            gameSize: this.GAME_SIZE,
            ball: {
                color: Ball.COLOR,
                diameter: Ball.DIAMETER,
                mass: Ball.MASS
            }
        };

        winston.info(`PhysicsNetwork - starting game with players: ${this.player1.socket.id} : ${this.player2.socket.id}.`);

        this.player1.socket.emit('GameFound', gameFound);
        this.player2.socket.emit('GameFound', gameFound);

        this.intervalReference = setInterval(this.heartbeat, this.FIXED_TIME_STEP);
        this.gameStated = true;
    }

    stopGame = () => {
        this.gameStated = false;
        clearInterval(this.intervalReference);
    }

    private heartbeat = () => {
        this.tick++;
        this.ball.onUpdate();

        this.world.step(this.FIXED_TIME_STEP, this.FIXED_TIME_STEP, this.MAX_SUB_STEPS);
        const serverTick: LunnNet.PhysicsNetwork.ServerTick = {
            tick: this.tick,
            players: [
                this.player1.toUpdateNetworkPlayerPlayer(),
                this.player2.toUpdateNetworkPlayerPlayer()
            ]
        };

        // winston.info(`heartbeat: ${serverTick.players[0].velocity}`);

        this.player1.socket.emit('ServerTick', serverTick);
        this.player2.socket.emit('ServerTick', serverTick);
    }

    private onBeginContact() {
        // this.world.on('beginContact', () => {
        //     winston.info(`beginContact: ${this.ball.body.velocity[0]} : ${this.ball.body.velocity[1]}`);
        // }, this);

        // this.world.on('impact', () => {
        //     winston.info(`impact: ${this.ball.body.velocity[0]} : ${this.ball.body.velocity[1]}`);
        // }, this);

        this.world.on('endContact', () => {
            winston.info(`endContact: ${this.ball.body.velocity[0]} : ${this.ball.body.velocity[1]} : ${this.ball.body.angularVelocity} `);

            this.ballTick++;
            const ballUpdate = this.ball.toBallUpdate(this.ballTick);

            this.player1.socket.emit('BallUpdate', ballUpdate);
            this.player2.socket.emit('BallUpdate', ballUpdate);
        }, this);
    }

    private listenToEvents(socket: SocketIO.Socket) {
        socket.on('UpdateFromClient', (data: LunnNet.PhysicsNetwork.UpdateFromClient) => { this.handleOnPlayerUpdate(socket.id, data); });
        socket.on('disconnect', this.stopGame);
    }

    private handleOnPlayerUpdate = (id: string, data: LunnNet.PhysicsNetwork.UpdateFromClient) => {
        if (!this.gameStated) {
            return;
        }

        const player = this.player1.socket.id === id ? this.player1 : this.player2;

        player.moveRight(data.velocityHorizontal);
        player.moveUp(data.velocityVertical);

        // winston.info(`handleOnPlayerUpdate: ${player.socket.id} : ${data.velocityHorizontal}`);
    }

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
            angle: (3 * Math.PI) / 2,
            position: [0, 0]
        });
        left.addShape(new p2.Plane());
        world.addBody(left);
    }
}