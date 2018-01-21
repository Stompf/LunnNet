import * as Phaser from 'phaser-ce';
import * as socketIO from 'socket.io-client';
import { Player } from './player';
// import { KeyMapping } from './key-mapping';

export class PhysicsNetworkGame {

    protected game: Phaser.Game;
    private socket: SocketIOClient.Socket;
    private serverIP = 'http://localhost:4444';

    private players: Player[];
    private networkGameStarted = false;
    private latestNetworkTick = 0;

    constructor(canvasId: string) {
        this.game = new Phaser.Game(1200, 600, Phaser.AUTO, canvasId, { preload: this.preload, create: this.create, update: this.update });
    }

    destroy() {
        this.game.destroy();
    }

    private preload = () => {
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    }

    protected initPixi() {
        PIXI.Sprite.defaultAnchor = { x: 0.5, y: 0.5 };

        this.game.stage.backgroundColor = 0xFFFFFF;
        this.game.renderer.view.style.border = '1px solid black';
        this.game.world.setBounds(0, 0, this.game.width, this.game.height);
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.stage.disableVisibilityChange = true;
    }

    protected create = () => {
        this.initPixi();
        this.connect();
    }

    protected update = () => {
        if (!this.networkGameStarted) {
            return;
        }

        this.players.forEach(player => {
            player.onLocalUpdate(this.game);

            if (player.isLocalPlayer) {
                this.socket.emit('PlayerUpdate', player.toUpdateNetworkPlayer());
            }
        });
    }

    private connect() {
        this.socket = socketIO(this.serverIP);
        this.socket.on('connect', () => {
            console.info('connected to server');
            this.queue();
        });

        this.socket.on('GameFound', (data: LunnNet.PhysicsNetwork.GameFound) => {
            console.info('game found');
            this.initNewNetworkGame(data);
        });

        this.socket.on('disconnect', () => {
            console.info('disconnected');
            this.networkGameStarted = false;
        });

        this.socket.on('ServerTick', (data: LunnNet.PhysicsNetwork.ServerTick) => {
            if (this.latestNetworkTick > data.tick) {
                return;
            }

            data.players.forEach(networkPlayerUpdate => {
                const player = this.players.find(p => p.id === networkPlayerUpdate.id);
                if (player) {
                    player.onNetworkUpdate(networkPlayerUpdate);
                }
            });

            this.latestNetworkTick = data.tick;
        });
    }

    private initNewNetworkGame(data: LunnNet.PhysicsNetwork.GameFound) {
        this.latestNetworkTick = 0;
        this.players = [];
        this.game.physics.p2.world.gravity = data.physicsOptions.gravity;
        this.game.physics.p2.restitution = data.physicsOptions.restitution;
        this.game.width = data.gameSize.width;
        this.game.height = data.gameSize.height;
        this.game.world.removeChildren();
        this.game.physics.p2.clear();

        data.players.forEach(player => {
            this.players.push(new Player(this.game, this.socket.id === player.id, player));
        });

        this.networkGameStarted = true;
    }

    private queue() {
        this.socket.emit('QueueMatchMaking', { game: 'PhysicsNetwork' } as LunnNet.Network.QueueMatchMaking);
        console.info('Looking for game...');
    }
}