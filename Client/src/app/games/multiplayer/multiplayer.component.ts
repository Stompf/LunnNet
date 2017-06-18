import { Component, OnInit, OnDestroy } from '@angular/core';
import { LunnEngineComponent } from 'lunnEngine/LunnEngineComponent';
import * as socketIO from 'socket.io-client';

@Component({
  selector: 'app-multiplayer',
  templateUrl: './multiplayer.component.html',
  styleUrls: ['./multiplayer.component.css']
})
export class MultiplayerComponent extends LunnEngineComponent implements OnInit, OnDestroy {

  constructor() {
    super();
  }

  ngOnInit() {
    this.init(800, 600,
      { view: document.getElementById('multiplayer-canvas') as HTMLCanvasElement, backgroundColor: 0x000000 });

    this.connect();
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  private connect() {
    const io = socketIO('http://localhost:3000');
    io.on('connect', () => {
      alert('connected!');
    });

    io.on('disconnect', () => {
      alert('disconnect!');
    });
  }
}
