import * as Phaser from 'phaser-ce';
import * as socketIO from 'socket.io-client';
import { Player } from './player';
// import { KeyMapping } from './key-mapping';

export class PhysicsNetworkGame {

    protected game: Phaser.Game;
    private socket: SocketIOClient.Socket;
    private serverIP = 'http://localhost:4444';

    private players: Player[];

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
        this.game.physics.startSystem(Phaser.Physics.P2JS);
    }

    protected create = () => {
        this.initPixi();
        this.connect();
    }

    protected update = () => {
        // TODO
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
        });

        this.socket.on('ServerTick', (_data: LunnNet.PhysicsNetwork.ServerTick) => {
            // TODO
        });
    }

    private initNewNetworkGame(data: LunnNet.PhysicsNetwork.GameFound) {
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
    }

    private queue() {
        this.socket.emit('QueueMatchMaking', { game: 'PhysicsNetwork' } as LunnNet.Network.QueueMatchMaking);
        console.info('Looking for game...');
    }
}