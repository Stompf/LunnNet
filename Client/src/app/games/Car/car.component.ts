import { Component, OnInit, OnDestroy } from '@angular/core';
import { LunnEngineComponent } from 'lunnEngine/LunnEngineComponent';
import { KeyMapping } from './States/KeyMapping';
import * as p2 from 'p2';
import * as PIXI from 'pixi.js';

@Component({
  selector: 'app-car',
  templateUrl: './car.component.html',
  styleUrls: ['./car.component.css']
})
export class CarComponent extends LunnEngineComponent implements OnInit, OnDestroy {

  private container: PIXI.Container;
  private carGraphics: PIXI.Graphics;
  private boxGraphics: PIXI.Graphics;
  private world: p2.World;
  private chassisBody: p2.Body;
  private boxBody: p2.Body;
  private currentAnimation: number;
  private maxSteer = Math.PI / 5;
  private backWheel: p2.WheelConstraint;
  private frontWheel: p2.WheelConstraint;

  constructor() {
    super();

  }

  ngOnInit() {
    this.world = new p2.World({
      gravity: [0, 0]
    });

    // Add a box
    const boxShape = new p2.Box({
      width: 0.3,
      height: 0.3
    });
    this.boxBody = new p2.Body({
      mass: 0.3,
      position: [0, 3]
    });

    this.boxBody.addShape(boxShape);
    this.world.addBody(this.boxBody);

    const chassisShape = new p2.Box({ width: 0.5, height: 1 });
    this.chassisBody = new p2.Body({
      mass: 1
    });
    this.chassisBody.addShape(chassisShape);
    this.world.addBody(this.chassisBody);

    // Create the vehicle
    const vehicle = new p2.TopDownVehicle(this.chassisBody);

    // Add one front wheel and one back wheel - we don't actually need four :)
    this.frontWheel = vehicle.addWheel({
      localPosition: [0, 0.5] // front
    });
    this.frontWheel.setSideFriction(4);

    // Back wheel
    this.backWheel = vehicle.addWheel({
      localPosition: [0, -0.5] // back
    });
    this.backWheel.setSideFriction(3); // Less side friction on back wheel makes it easier to drift
    this.backWheel.engineForce = 0;
    vehicle.addToWorld(this.world);

    const zoom = 100;
    const canvas = document.getElementById('carCanvas') as HTMLCanvasElement;

    this.init(800, 600, { view: canvas, backgroundColor: 0xFFFFFF });

    this.container = new PIXI.Container();
    this.container.position.x = this.app.renderer.width / 2; // center at origin
    this.container.position.y = this.app.renderer.height / 2;
    this.container.scale.x = zoom;  // zoom in
    this.container.scale.y = -zoom; // Note: we flip the y axis to make "up" the physics "up"

    this.carGraphics = new PIXI.Graphics();
    this.carGraphics.beginFill(0xff0000);
    this.carGraphics.drawRect(-chassisShape.width / 2, -chassisShape.height / 2, chassisShape.width, chassisShape.height);
    this.container.addChild(this.carGraphics);

    this.boxGraphics = new PIXI.Graphics();
    this.boxGraphics.beginFill(0x0000ff);
    this.boxGraphics.drawRect(-boxShape.width / 2, -boxShape.height / 2, boxShape.width, boxShape.height);
    this.container.addChild(this.boxGraphics);

    this.addPlanes(this.world, this.app.renderer.height, this.app.renderer.width);
    this.animate();
  }

  private addPlanes(world: p2.World, height: number, width: number) {

    // Top plane
    const planeTop = new p2.Body({
      position: [0, 3],
      angle: Math.PI
    });
    planeTop.addShape(new p2.Plane());
    world.addBody(planeTop);

    // Bottom plane
    const planeButtom = new p2.Body({
      position: [0, -3],
    });
    planeButtom.addShape(new p2.Plane());
    world.addBody(planeButtom);

    // Left plane
    const planeLeft = new p2.Body({
      angle: -Math.PI / 2,
      position: [-3, 0]
    });
    planeLeft.addShape(new p2.Plane());
    world.addBody(planeLeft);

    // Right plane
    const planeRight = new p2.Body({
      angle: Math.PI / 2,
      position: [3, 0]
    });
    planeRight.addShape(new p2.Plane());
    world.addBody(planeRight);
  }

  // Animation loop
  private animate = (t?: number) => {
    t = t || 0;
    this.currentAnimation = requestAnimationFrame(this.animate);
    // this.backWheel.engineForce = 0;
    // this.backWheel.setBrakeForce(0);

    // Move physics bodies forward in time
    this.world.step(1 / 60);

    if (this.isKeyPressed(KeyMapping.Mapping.walk_up)) {
      this.backWheel.engineForce = 1;
    }

    if (this.isKeyPressed(KeyMapping.Mapping.walk_back)) {
      if (this.backWheel.getSpeed() > 0.1) {
        // Moving forward - add some brake force to slow down
        this.backWheel.setBrakeForce(5);
      } else {
        // Moving backwards - reverse the engine force
        this.backWheel.setBrakeForce(0);
        this.backWheel.engineForce = -0.5;
      }
    }

    let left = 0;
    if (this.isKeyPressed(KeyMapping.Mapping.walk_left)) {
      left = 1;
    }

    let right = 0;
    if (this.isKeyPressed(KeyMapping.Mapping.walk_right)) {
      right = 1;
    }
    this.frontWheel.steerValue = this.maxSteer * (left - right);

    // Transfer positions of the physics objects to Pixi.js
    this.carGraphics.position.x = this.chassisBody.position[0];
    this.carGraphics.position.y = this.chassisBody.position[1];
    this.carGraphics.rotation = this.chassisBody.angle;

    this.boxGraphics.position.x = this.boxBody.position[0];
    this.boxGraphics.position.y = this.boxBody.position[1];
    this.boxGraphics.rotation = this.boxBody.angle;

    // Render scene
    this.app.renderer.render(this.container);
  }


  ngOnDestroy() {
    cancelAnimationFrame(this.currentAnimation)
    this.destroy();
  }
}
