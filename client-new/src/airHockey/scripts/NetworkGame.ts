import * as socketIO from 'socket.io-client';
import { BaseAirHockeyGame } from './BaseAirHockeyGame';

export class NetworkGame extends BaseAirHockeyGame {

    private socket: SocketIOClient.Socket;
    private ip = 'http://localhost:4444';

    initNewGame(app: PIXI.Application) {
        super.initNewGame(app);
        this.connect();
    }

    onClose(): void {
        this.disconnect();
    }

    private connect() {
        this.socket = socketIO(this.ip);
        this.socket.on('connect', () => {
            this.appendTextareaLine('Connected');
            this.queue();
        });

        this.socket.on('GameFound', (_data: LunnNet.AirHockey.GameFound) => {
            this.appendTextareaLine('GameFound');
        });

        this.socket.on('disconnect', () => {
            this.appendTextareaLine('Disconnected');
        });
    }

    private disconnect() {
        if (this.socket != null) {
            this.socket.emit('RemoveFromMatchMaking', {} as LunnNet.Network.RemoveFromMatchMaking);
            this.socket.close();
        }
    }

    private queue() {
        this.socket.emit('QueueMatchMaking', { game: LunnNet.Game.AirHockey } as LunnNet.Network.QueueMatchMaking);
        this.appendTextareaLine('Looking for game...');
    }
}