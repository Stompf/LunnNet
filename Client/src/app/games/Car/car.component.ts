import { Component, OnInit } from '@angular/core';
import * as p2 from 'p2';
import * as PIXI from 'pixi.js';

@Component({
  selector: 'app-car',
  templateUrl: './car.component.html',
  styleUrls: ['./car.component.css']
})
export class CarComponent implements OnInit {

  private renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer;
  private container: PIXI.Container;
  private graphics: PIXI.Graphics;
  private world: p2.World;
  private chassisBody: p2.Body;

  constructor() {


  }

  ngOnInit() {
    this.world = new p2.World({
      gravity: [0, 0]
    });

    this.chassisBody = new p2.Body({
      mass: 1
    });
    const boxShape = new p2.Box({ width: 0.5, height: 1 });
    this.chassisBody.addShape(boxShape);
    this.world.addBody(this.chassisBody);

    // Create the vehicle
    const vehicle = new p2.TopDownVehicle(this.chassisBody);

    // Add one front wheel and one back wheel - we don't actually need four :)
    const frontWheel = vehicle.addWheel({
      localPosition: [0, 0.5] // front
    });
    frontWheel.setSideFriction(4);

    // Back wheel
    const backWheel = vehicle.addWheel({
      localPosition: [0, -0.5] // back
    });
    backWheel.setSideFriction(3); // Less side friction on back wheel makes it easier to drift
    vehicle.addToWorld(this.world);

    // Steer value zero means straight forward. Positive is left and negative right.
    frontWheel.steerValue = Math.PI / 16;

    // Engine force forward
    backWheel.engineForce = 10;
    backWheel.setBrakeForce(0);

    const zoom = 100;
    const canvas = document.getElementById('carCanvas') as HTMLCanvasElement;
    this.renderer = PIXI.autoDetectRenderer(600, 800, { view: canvas, backgroundColor: 0xFFFFFF });

    this.container = new PIXI.Container();
    this.container.position.x = this.renderer.width / 2; // center at origin
    this.container.position.y = this.renderer.height / 2;
    this.container.scale.x = zoom;  // zoom in
    this.container.scale.y = -zoom; // Note: we flip the y axis to make "up" the physics "up"

    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill(0xff0000);
    this.graphics.drawRect(-boxShape.width / 2, -boxShape.height / 2, boxShape.width, boxShape.height);

    this.container.addChild(this.graphics);

    this.addPlanes(this.world, this.renderer.height, this.renderer.width);
    this.animate();
  }

  private addPlanes(world: p2.World, height: number, width: number) {

    // Top plane
    const planeTop = new p2.Body({
      position: [0, height],
      angle: Math.PI
    });
    // planeTop.
    planeTop.addShape(new p2.Plane());
    world.addBody(planeTop);

    // // Bottom plane
    // const planeButtom = new p2.Body({
    //   position: [0, ymin],
    // });
    // planeButtom.addShape(new p2.Plane());
    // world.addBody(planeButtom);

    // // Left plane
    // const planeLeft = new p2.Body({
    //   angle: -Math.PI / 2,
    //   position: [0, 0]
    // });
    // planeLeft.addShape(new p2.Plane());
    // world.addBody(planeLeft);

    // // Right plane
    // const planeRight = new p2.Body({
    //   angle: Math.PI / 2,
    //   position: [xmax, 0]
    // });
    // planeRight.addShape(new p2.Plane());
    // world.addBody(planeRight);
  }

  // Animation loop
  private animate = (t?: number) => {
    t = t || 0;
    requestAnimationFrame(this.animate);

    // Move physics bodies forward in time
    this.world.step(1 / 60);

    // Transfer positions of the physics objects to Pixi.js
    this.graphics.position.x = this.chassisBody.position[0];
    this.graphics.position.y = this.chassisBody.position[1];
    this.graphics.rotation = this.chassisBody.angle;

    // Render scene
    this.renderer.render(this.container);
  }

}
