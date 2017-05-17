import { Component, OnInit, OnDestroy } from '@angular/core';
import * as $ from 'jquery';
import * as PIXI from 'pixi.js';
import { LunnEngineComponent } from 'lunnEngine/LunnEngineComponent';
import * as KeyMapping from './States/KeyMapping';

@Component({
  moduleId: module.id,
  selector: 'app-first',
  templateUrl: './first.component.html',
  styleUrls: ['./first.component.css']
})
export class FirstComponent extends LunnEngineComponent implements OnInit, OnDestroy {

  constructor() {
    super();
  }

  ngOnInit() {
    this.init(800, 600, { backgroundColor: 0x1099bb, view: $('#firstGameCanvas').get(0) as HTMLCanvasElement });

    PIXI.loader.add('bunny', 'assets/bunny.png').load((loader: any, resources: any) => {

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
      this.app.ticker.add(() => {

        if (this.isKeyPressed(KeyMapping.KeyMapping.Mapping.walk_forward)) {
          bunny.y -= 5;
        }
        if (this.isKeyPressed(KeyMapping.KeyMapping.Mapping.walk_back)) {
          bunny.y += 5;
        }
        if (this.isKeyPressed(KeyMapping.KeyMapping.Mapping.walk_left)) {
          bunny.x -= 5;
        }
        if (this.isKeyPressed(KeyMapping.KeyMapping.Mapping.walk_right)) {
          bunny.x += 5;
        }
      });
    });


  }

  ngOnDestroy() {
    this.destroy();
  }

}
