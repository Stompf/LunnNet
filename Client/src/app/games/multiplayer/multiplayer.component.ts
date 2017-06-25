import { Component, OnInit, OnDestroy } from '@angular/core';
import { LunnEngineComponent } from 'lunnEngine/LunnEngineComponent';
import * as socketIO from 'socket.io-client';

@Component({
  selector: 'app-multiplayer',
  templateUrl: './multiplayer.component.html',
  styleUrls: ['./multiplayer.component.css']
})
export class MultiplayerComponent extends LunnEngineComponent implements OnInit, OnDestroy {

  io: SocketIOClient.Socket;

  private ip = 'http://localhost:3333';

  constructor() {
    super();
  }

  ngOnInit() {
    this.init(800, 600,
      { view: document.getElementById('multiplayer-canvas') as HTMLCanvasElement, backgroundColor: 0x000000 });

    this.connect();
  }

  ngOnDestroy(): void {
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
    const textarea = document.getElementById('multiplayer-textarea') as HTMLTextAreaElement;
    if (textarea != null) {
      textarea.value = text + '\n' + textarea.value;
    }
  }

  private queue() {
    this.io.emit('QueueMatchMaking', { game: LunnNet.Game.AirHockey } as LunnNet.Network.QueueMatchMaking)
    this.appendTextareaLine('Looking for game...');
  }
}
