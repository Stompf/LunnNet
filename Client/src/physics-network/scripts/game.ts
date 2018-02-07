import * as Phaser from 'phaser-ce';
import * as socketIO from 'socket.io-client';
import { Player } from './player';
import { Ball } from './ball';
// import { KeyMapping } from './key-mapping';

export class PhysicsNetworkGame {

    private readonly RECEIVE_BALL_UPDATES = true;

    protected game: Phaser.Game;
    private socket!: SocketIOClient.Socket;
    private serverIP = process.env.NODE_ENV === 'production'
        ? 'https://home.lunne.nu'
        : 'http://localhost:4444';

    private players!: Player[];
    private ball!: Ball;
    private networkGameStarted = false;
    private latestNetworkTick = 0;

    private connectStatusText!: Phaser.Text;

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

        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.stage.backgroundColor = 0xFFFFFF;
        this.game.renderer.view.style.border = '1px solid black';
        this.game.stage.disableVisibilityChange = true;
    }

    protected create = () => {
        this.initPixi();
        this.initTexts();
        this.connect();
    }

    protected update = () => {
        if (!this.networkGameStarted) {
            return;
        }

        this.ball.onUpdate();

        this.players.forEach(player => {
            player.onLocalUpdate(this.game);

            if (player.isLocalPlayer) {
                this.socket.emit('UpdateFromClient', player.toUpdateNetworkPlayer());
            }
        });
    }

    private initTexts() {
        this.connectStatusText = this.game.add.text(this.game.world.centerX, this.game.world.centerY, 'Connecting...');
        this.connectStatusText.anchor.set(0.5, 0.5);
    }

    private connect() {
        this.connectStatusText.visible = true;
        this.socket = socketIO(this.serverIP);
        this.socket.on('connect', () => {
            this.connectStatusText.setText('Connected');
            this.queue();
        });

        this.socket.on('GameFound', (data: LunnNet.PhysicsNetwork.GameFound) => {
            this.connectStatusText.setText('Game found');
            this.initNewNetworkGame(data);
        });

        this.socket.on('disconnect', () => {
            this.game.world.removeChildren();
            this.game.physics.p2.clear();

            this.initTexts();
            this.connectStatusText.visible = true;
            this.connectStatusText.setText('Disconnected');
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

            if (this.RECEIVE_BALL_UPDATES) {
                this.ball.onNetworkUpdate(data.ballUpdate);
            }

            this.latestNetworkTick = data.tick;
        });

        // this.socket.on('BallUpdate', (data: LunnNet.PhysicsNetwork.BallUpdate) => {
        //     if (this.ballNetworkTick > data.tick) {
        //         return;
        //     }

        // });
    }

    private initNewNetworkGame(data: LunnNet.PhysicsNetwork.GameFound) {
        this.connectStatusText.visible = false;
        this.latestNetworkTick = 0;
        this.players = [];
        this.game.physics.p2.world.gravity = data.physicsOptions.gravity;
        this.game.physics.p2.restitution = data.physicsOptions.restitution;
        this.game.physics.p2.world.defaultContactMaterial.friction = 0;
        this.game.width = data.gameSize.width;
        this.game.height = data.gameSize.height;
        this.game.world.removeChildren();
        this.game.physics.p2.clear();
        this.game.world.setBounds(0, 0, this.game.width, this.game.height);

        data.players.forEach(player => {
            this.players.push(new Player(this.game, this.socket.id === player.id, player));
        });

        this.ball = new Ball(this.game, data.ball);

        this.networkGameStarted = true;
    }

    private queue() {
        this.socket.emit('QueueMatchMaking', { game: 'PhysicsNetwork' } as LunnNet.Network.QueueMatchMaking);
        this.connectStatusText.setText('Looking for game...');
    }
}