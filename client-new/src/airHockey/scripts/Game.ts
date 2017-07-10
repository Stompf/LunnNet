import { LunnEngineComponent } from '../../lunnEngine/LunnEngineComponent';
import * as socketIO from 'socket.io-client';

export class AirHockeyGame extends LunnEngineComponent {

    io: SocketIOClient.Socket;

    private ip = 'http://localhost:4444';

    constructor() {
        super();
    }

    onInit() {
        this.init(800, 600,
            { view: document.getElementById('AirHockeyCanvas') as HTMLCanvasElement, backgroundColor: 0x000000 });

        this.connect();
    }

    onDestroy(): void {
        if (this.io != null) {
            this.io.emit('RemoveFromMatchMaking', {} as LunnNet.Network.RemoveFromMatchMaking);
            this.io.close();
        }
        this.destroy();
    }

    private connect() {
        this.io = socketIO(this.ip);
        this.io.on('connect', () => {
            this.appendTextareaLine('Connected');
            this.queue();
        });

        this.io.on('disconnect', () => {
            this.appendTextareaLine('Disconnected');
        });
    }

    private appendTextareaLine(text: string) {
        const textarea = document.getElementById('AirHockeyTextarea') as HTMLTextAreaElement;
        if (textarea != null) {
            textarea.value = text + '\n' + textarea.value;
        }
    }

    private queue() {
        this.io.emit('QueueMatchMaking', { game: LunnNet.Game.AirHockey } as LunnNet.Network.QueueMatchMaking);
        this.appendTextareaLine('Looking for game...');
    }
}
