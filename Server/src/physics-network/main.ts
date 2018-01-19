import { Player } from './player';
import * as winston from 'winston';
import * as p2 from 'p2';

export class PhysicsNetwork {

    private readonly fixedTimeStep = 1 / 60;
    private readonly maxSubSteps = 10;
    private intervalReference = 0;

    private player1: Player;
    private player2: Player;
    private world: p2.World;

    private readonly GameSize: LunnNet.Utils.Size = { width: 1200, height: 600 };

    constructor(player1Socket: SocketIO.Socket, player2Socket: SocketIO.Socket) {
        this.world = new p2.World({ gravity: [0, 0] });
        this.world.defaultContactMaterial.restitution = 1;
        this.player1 = new Player(this.world, player1Socket, 0xFF0000, { x: this.GameSize.width / 2, y: this.GameSize.height / 2 });
        this.player2 = new Player(this.world, player2Socket, 0xA7A7A7, { x: this.GameSize.width / 4, y: this.GameSize.height / 2 });
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
            gameSize: this.GameSize
        };

        winston.info(`PhysicsNetwork - starting game with players: ${this.player1.socket.id} : ${this.player2.socket.id}.`);

        this.player1.socket.emit('GameFound', gameFound);
        this.player2.socket.emit('GameFound', gameFound);

        this.intervalReference = window.setInterval(this.heartbeat, this.fixedTimeStep);
    }

    private heartbeat = () => {
        this.world.step(this.fixedTimeStep, this.fixedTimeStep, this.maxSubSteps);
    }
}