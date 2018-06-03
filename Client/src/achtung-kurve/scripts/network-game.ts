import { BaseAchtungGame } from './base-game';
import * as socketIO from 'socket.io-client';
import { Group } from 'phaser-ce';
import { PlayerOptions } from 'src/achtung-kurve/models';
import { KeyMapping } from './key-mapping';
import { NetworkPlayer } from './network-player';

export class NetworkAchtungGame extends BaseAchtungGame {
    private socket: SocketIOClient.Socket | undefined;
    private networkGameStarted: boolean = false;
    private latestNetworkTick: number = 0;
    private connectStatusText!: Phaser.Text;
    private content!: Group;
    protected players: NetworkPlayer[] = [];

    private get Id() {
        return this.socket ? this.socket.id : '';
    }

    private serverIP = process.env.NODE_ENV === 'production'
        ? 'https://home.lunne.nu'
        : 'http://localhost:4444';

    constructor(canvasId: string) {
        super(canvasId);
    }

    destroy() {
        if (this.socket) {
            this.socket.close();
        }
    }

    protected preload() {
        super.preload();
        this.game.world.scale.set(10);
    }

    protected create() {
        super.create();
        setTimeout(() => {
            this.connect();
        }, 250);
    }

    protected update() {
        if (!this.socket || !this.networkGameStarted) {
            return;
        }

        this.players.forEach(p => {
            if (this.socket && p.onUpdate(this.game)) {
                this.socket.emit('UpdateFromClient', p.toUpdateFromClient());
            }
        });
    }

    private connect() {
        if (!this.connectStatusText) {
            this.connectStatusText = this.game.add.text(
                this.game.world.centerX,
                this.game.world.centerY,
                'Connecting...'
            );
            this.connectStatusText.anchor.set(0.5, 0.5);
            this.connectStatusText.visible = true;
        }
        if (!this.content) {
            this.content = new Group(this.game);
        }

        this.initSocket();
    }

    private initSocket = () => {
        if (this.socket) {
            this.socket.close();
        }

        this.latestNetworkTick = 0;
        this.socket = socketIO(this.serverIP);
        this.socket.on('connect', () => {
            this.connectStatusText.setText('Connected');
            this.queue();
        });

        this.socket.on('GameFound', (data: LunnNet.AchtungKurve.GameFound) => {
            this.connectStatusText.setText('Game found');
            this.initNewNetworkGame(data);
        });

        this.socket.on('disconnect', () => {
            if (this.game.stage == null) {
                return;
            }

            this.content.removeAll();

            this.connectStatusText.visible = true;
            this.connectStatusText.setText('Disconnected');
            this.networkGameStarted = false;
            this.connect();
        });

        this.socket.on('ServerTick', (data: LunnNet.AchtungKurve.ServerTick) => {
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
    };

    private initNewNetworkGame(data: LunnNet.AchtungKurve.GameFound) {
        this.clear();
        this.connectStatusText.visible = false;
        this.game.width = data.gameSize.width;
        this.game.height = data.gameSize.height;

        data.players.forEach(player => {
            const options: PlayerOptions = {
                color: player.color,
                id: player.id,
                diameter: data.options.player.diameter,
                movement: player.startMovement,
                position: player.startPosition,
                speed: data.options.player.speed,
                isLocalPlayer: player.id === this.Id
            };

            const networkPlayer = new NetworkPlayer(this.game, options, KeyMapping.Player1Mapping);
            this.players.push(networkPlayer);

            this.content.add(networkPlayer.graphics);
        });

        this.networkGameStarted = true;
    }

    private clear() {
        this.latestNetworkTick = 0;
        this.players = [];
        this.content.removeAll();
    }

    private queue() {
        if (!this.socket) {
            return;
        }

        this.socket.emit('QueueMatchMaking', {
            game: 'AchtungKurve'
        } as LunnNet.Network.QueueMatchMaking);
        this.connectStatusText.setText('Looking for game...');
    }
}
