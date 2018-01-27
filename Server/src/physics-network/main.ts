import { Player } from './player';
import * as winston from 'winston';
import * as p2 from 'p2';

export class PhysicsNetwork {

    private readonly fixedTimeStep = 1 / 60;
    private readonly maxSubSteps = 10;
    private intervalReference: NodeJS.Timer;
    private tick = 0;
    private gameStated: boolean;

    private player1: Player;
    private player2: Player;
    private world: p2.World;

    private readonly GameSize: LunnNet.Utils.Size = { width: 1200, height: 600 };

    constructor(player1Socket: SocketIO.Socket, player2Socket: SocketIO.Socket) {
        this.gameStated = false;
        this.world = new p2.World({ gravity: [0, 0] });
        this.world.defaultContactMaterial.restitution = 1;
        this.addWorldBounds(this.world);

        this.player1 = new Player(this.world, player1Socket, 0xFF0000, { x: this.GameSize.width / 1.25 - this.player1.DIAMETER, y: this.GameSize.height / 2 });
        this.player2 = new Player(this.world, player2Socket, 0x0000FF, { x: this.GameSize.width / 4, y: this.GameSize.height / 2 });

        this.listenToEvents(player1Socket);
        this.listenToEvents(player2Socket);
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
            gameSize: this.GameSize,
            ball: {
                color: 0x000000,
                diameter: 30,
                mass: 0.1
            }
        };

        winston.info(`PhysicsNetwork - starting game with players: ${this.player1.socket.id} : ${this.player2.socket.id}.`);

        this.player1.socket.emit('GameFound', gameFound);
        this.player2.socket.emit('GameFound', gameFound);

        this.intervalReference = setInterval(this.heartbeat, this.fixedTimeStep);
        this.gameStated = true;
    }

    stopGame() {
        this.gameStated = false;
        clearInterval(this.intervalReference);
    }

    private heartbeat = () => {
        this.tick++;
        this.world.step(this.fixedTimeStep, this.fixedTimeStep, this.maxSubSteps);

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

    private listenToEvents(socket: SocketIO.Socket) {
        socket.on('PlayerUpdate', this.handleOnPlayerUpdate);
    }

    private handleOnPlayerUpdate = (data: LunnNet.PhysicsNetwork.UpdateNetworkPlayer) => {
        if (!this.gameStated) {
            return;
        }

        const player = this.player1.socket.id === data.id ? this.player1 : this.player2;

        // winston.info(`handleOnPlayerUpdate: ${player.socket.id} : ${data.velocity}`);

        player.body.position = [data.position.x, data.position.y];
    }

    private addWorldBounds(world: p2.World) {
        let floor = new p2.Body({
            position: [0, 0]
        });
        floor.addShape(new p2.Plane());
        world.addBody(floor);

        let ceiling = new p2.Body({
            angle: Math.PI,
            position: [0, this.GameSize.height]
        });
        ceiling.addShape(new p2.Plane());
        world.addBody(ceiling);

        let right = new p2.Body({
            angle: Math.PI / 2,
            position: [this.GameSize.width, 0]
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