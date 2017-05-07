import { Component, OnInit, OnDestroy } from '@angular/core';
import * as $ from 'jquery';
import * as PIXI from 'pixi.js';

@Component({
  moduleId: module.id,
  selector: 'app-first',
  templateUrl: './first.component.html',
  styleUrls: ['./first.component.css']
})
export class FirstComponent implements OnInit, OnDestroy {

  private app: PIXI.Application;

  constructor() {
  }

  ngOnInit() {
    this.app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb, view: $('#firstGameCanvas').get(0) as HTMLCanvasElement });

    PIXI.loader.add('bunny', 'assets/bunny.png').load((loader, resources) => {

      // This creates a texture from a 'bunny.png' image.
      const bunny = new PIXI.Sprite(resources.bunny.texture);

      // Setup the position of the bunny
      bunny.x = this.app.renderer.width / 2;
      bunny.y = this.app.renderer.height / 2;

      // Rotate around the center
      bunny.anchor.x = 0.5;
      bunny.anchor.y = 0.5;

      // Add the bunny to the scene we are building.
      this.app.stage.addChild(bunny);

      // Listen for frame updates
      this.app.ticker.add(function () {
        // each frame we spin the bunny around a bit
        bunny.rotation += 0.1;
      });
    });

    $(document).keydown(this.keydown);
    $(document).keyup(this.keyup);
  }

  ngOnDestroy() {
    PIXI.loader.reset();
    this.app.destroy();
    this.unsubscribeEvents();
  }

  private unsubscribeEvents() {
    $(document).off('keydown', this.keydown);
    $(document).off('keyup', this.keyup);
  }

  private keydown = (e: JQueryMouseEventObject) => {
    console.log('keydown: ' + e.which);
  }

  private keyup = (e: JQueryMouseEventObject) => {
    console.log('keyup: ' + e.which);
  }

}
