import { Component, OnInit } from '@angular/core';
import * as PIXI from 'pixi.js';
import * as p2 from 'p2';
import * as _ from 'lodash';
import { Player } from './scripts/Player';

@Component({
  selector: 'app-asteroids',
  templateUrl: './asteroids.component.html',
  styleUrls: ['./asteroids.component.css']
})

export class AsteroidsComponent implements OnInit {

  ctx: CanvasRenderingContext2D;
  zoom: number;
  player: Player;
  spaceWidth = 16;
  spaceHeight = 9;
  world: p2.World;

  numAsteroidLevels = 4;
  asteroidRadius = 0.9;
  maxAsteroidSpeed = 2;
  asteroids: Asteroids.Asteroid[] = [];
  numAsteroidVerts = 10;
  SHIP = Math.pow(2, 1);
  BULLET = Math.pow(2, 2);
  ASTEROID = Math.pow(2, 3);
  initSpace = this.asteroidRadius * 2;
  level = 1;
  removeBodies: p2.Body[] = [];
  addBodies: p2.Body[] = [];

  keyLeft = 0;
  keyRight = 0;
  keyUp = 0;
  keyShoot = 0;

  lastTime: number;
  maxSubSteps = 5; // Max physics ticks per render frame
  fixedDeltaTime = 1 / 30; // Physics "tick" delta time

  constructor() { }

  ngOnInit() {
    // Catch key down events
    window.onkeydown = (evt) => {
      this.handleKey(evt.keyCode, 1);
    }

    // Catch key up events
    window.onkeyup = (evt) => {
      this.handleKey(evt.keyCode, 0);
    }

    this.init();
    this.animate(0);
  }

  private init() {
    // Init canvas
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    canvas.width = 800;
    canvas.height = 600;

    this.zoom = canvas.height / this.spaceHeight;
    if (canvas.width / this.spaceWidth < this.zoom) {
      this.zoom = canvas.width / this.spaceWidth;
    }

    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.ctx.lineWidth = 2 / this.zoom;
    this.ctx.strokeStyle = this.ctx.fillStyle = 'white';

    // Init physics world
    this.world = new p2.World({
      gravity: [0, 0]
    });

    // Turn off friction, we don't need it.
    this.world.defaultContactMaterial.friction = 0;

    this.player = new Player();
    this.player.init(this.world, this.SHIP, this.ASTEROID);

    // Add ship physics
    this.world.on('postStep', () => {
      // Thrust: add some force in the ship direction
      this.player.body.applyForceLocal([0, this.keyUp * 2]);

      // Set turn velocity of ship
      this.player.body.angularVelocity = (this.keyLeft - this.keyRight) * this.player.turnSpeed;
    }, this);

    // Catch impacts in the world
    // Todo: check if several bullets hit the same asteroid in the same time step
    this.world.on('beginContact', (evt: any) => {
      const bodyA = evt.bodyA as p2.Body;
      const bodyB = evt.bodyB as p2.Body;
      const foundBulletA = _.find(this.player.bulletBodies, bullet => { return bullet.body === bodyA; });
      const foundBulletB = _.find(this.player.bulletBodies, bullet => { return bullet.body === bodyB; });

      if (this.player.visible && this.player.allowCollision && (bodyA === this.player.body || bodyB === this.player.body)) {

        // Ship collided with something
        this.player.allowCollision = false;

        const otherBody = (bodyA === this.player.body ? bodyB : bodyA);
        const foundAsteroid = _.find(this.asteroids, asteroid => { return asteroid.body === otherBody; });


        if (foundAsteroid != null) {
          this.player.lives--;
          this.updateLives();

          // Remove the ship body for a while
          this.removeBodies.push(this.player.body);
          this.player.visible = false;

          if (this.player.lives > 0) {
            const interval = setInterval(() => {
              // Check if the ship position is free from asteroids
              let free = true;
              for (let i = 0; i < this.asteroids.length; i++) {
                const a = this.asteroids[i];
                if (Math.pow(a.body.position[0] -
                  this.player.body.position[0], 2) +
                  Math.pow(a.body.position[1] -
                    this.player.body.position[1], 2) < this.initSpace) {

                  free = false;
                }
              }
              if (free) {
                // Add ship again
                this.player.body.force[0] = 0;
                this.player.body.force[1] = 0;
                this.player.body.velocity[0] = 0;
                this.player.body.velocity[1] = 0;
                this.player.body.angularVelocity = 0;
                this.player.body.angle = 0;
                this.player.visible = true;
                this.world.addBody(this.player.body);
                clearInterval(interval);
              }
            }, 100);
          } else {
            alert('Game Over!');
          }
        }
      } else if (foundBulletA != null || foundBulletB != null) {

        // Bullet collided with something
        const bulletBody = (foundBulletA ? foundBulletA : foundBulletB);
        const body = (bodyB === (bulletBody ? bulletBody.body : undefined) ? bodyA : bodyB);

        const found = _.find(this.asteroids, asteroid => { return asteroid.body === body; })
        if (found != null) {
          this.explode(found, bulletBody as Asteroids.Bullet);
        }
      }

    }, this);

    // Init asteroid shapes
    this.addAsteroids();

    // Update the text boxes
    this.updateLevel();
    this.updateLives();
  }

  // Animation loop
  private animate = (time: number) => {
    requestAnimationFrame(this.animate);

    this.updatePhysics(time);
    this.render(this.ctx);
  }

  private updatePhysics(time: number) {
    this.player.allowCollision = true;

    if (this.keyShoot && this.player.visible && this.world.time - this.player.lastShootTime > this.player.reloadTime) {
      this.shoot();
    }

    for (let i = 0; i < this.player.bulletBodies.length; i++) {
      const b = this.player.bulletBodies[i];

      // If the bullet is old, delete it
      if (b.dieTime <= this.world.time) {
        this.player.bulletBodies.splice(i, 1);
        this.world.removeBody(b.body);
        i--;
        continue;
      }
    }

    // Remove bodies scheduled to be removed
    for (let i = 0; i < this.removeBodies.length; i++) {
      this.world.removeBody(this.removeBodies[i]);
    }
    this.removeBodies.length = 0;

    // Add bodies scheduled to be added
    for (let i = 0; i < this.addBodies.length; i++) {
      this.world.addBody(this.addBodies[i]);
    }
    this.addBodies.length = 0;

    // Warp all bodies
    for (let i = 0; i < this.world.bodies.length; i++) {
      this.warp(this.world.bodies[i]);
    }

    // Get the elapsed time since last frame, in seconds
    let deltaTime = this.lastTime ? (time - this.lastTime) / 1000 : 0;
    this.lastTime = time;

    // Make sure the time delta is not too big (can happen if user switches browser tab)
    deltaTime = Math.min(1 / 10, deltaTime);

    // Move physics bodies forward in time
    this.world.step(this.fixedDeltaTime, deltaTime, this.maxSubSteps);
  }

  private shoot() {
    const angle = this.player.body.angle + Math.PI / 2;

    // Create a bullet body
    const bulletBody = new p2.Body({
      mass: 0.05,
      position: [
        this.player.shape.radius * Math.cos(angle) + this.player.body.position[0],
        this.player.shape.radius * Math.sin(angle) + this.player.body.position[1]
      ],
      // damping: 0,
      velocity: [ // initial velocity in ship direction
        2 * Math.cos(angle) + this.player.body.velocity[0],
        2 * Math.sin(angle) + this.player.body.velocity[1]
      ],
    });
    bulletBody.damping = 0;

    // Create bullet shape
    this.player.bulletShape = new p2.Circle({
      radius: this.player.bulletRadius,
      collisionGroup: this.BULLET, // Belongs to the BULLET group
      collisionMask: this.ASTEROID // Can only collide with the ASTEROID group
    });
    bulletBody.addShape(this.player.bulletShape);
    this.player.bulletBodies.push({ body: bulletBody, dieTime: this.world.time + this.player.bulletLifeTime });

    this.world.addBody(bulletBody);

    // Keep track of the last time we shot
    this.player.lastShootTime = this.world.time;
  }

  // If the body is out of space bounds, warp it to the other side
  private warp(body: p2.Body) {
    const p = body.position;
    if (p[0] > this.spaceWidth / 2) { p[0] = -this.spaceWidth / 2; }
    if (p[1] > this.spaceHeight / 2) { p[1] = -this.spaceHeight / 2 };
    if (p[0] < -this.spaceWidth / 2) { p[0] = this.spaceWidth / 2 };
    if (p[1] < -this.spaceHeight / 2) { p[1] = this.spaceHeight / 2 };

    // Set the previous position too, to not mess up the p2 body interpolation
    body.previousPosition[0] = p[0];
    body.previousPosition[1] = p[1];
  }


  private render(ctx: CanvasRenderingContext2D) {
    // Clear the canvas

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);


    ctx.fillStyle = '#FFFFFF';
    // Transform the canvas
    // Note that we need to flip the y axis since Canvas pixel coordinates
    // goes from top to bottom, while physics does the opposite.
    ctx.save();
    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2); // Translate to the center
    ctx.scale(this.zoom, -this.zoom);  // Zoom in and flip y axis

    // Draw all things
    this.drawShip();
    this.drawBullets();
    this.drawBounds();
    this.drawAsteroids();

    // Restore transform
    this.ctx.restore();
  }

  private drawShip() {
    if (this.player.visible) {
      const x = this.player.body.interpolatedPosition[0];
      const y = this.player.body.interpolatedPosition[1];
      const radius = this.player.shape.radius;
      this.ctx.save();
      this.ctx.translate(x, y);         // Translate to the ship center
      this.ctx.rotate(this.player.body.interpolatedAngle); // Rotate to ship orientation
      this.ctx.beginPath();
      this.ctx.moveTo(-radius * 0.6, -radius);
      this.ctx.lineTo(0, radius);
      this.ctx.lineTo(radius * 0.6, -radius);
      this.ctx.moveTo(-radius * 0.5, -radius * 0.5);
      this.ctx.lineTo(radius * 0.5, -radius * 0.5);
      this.ctx.closePath();
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  private drawAsteroids() {
    for (let i = 0; i < this.asteroids.length; i++) {
      const a = this.asteroids[i];
      const x = a.body.interpolatedPosition[0];
      const y = a.body.interpolatedPosition[1];
      const radius = (a.body.shapes[0] as p2.Circle).radius;
      this.ctx.save();
      this.ctx.translate(x, y);  // Translate to the center
      this.ctx.rotate(a.body.interpolatedAngle);

      this.ctx.beginPath();
      for (let j = 0; j < this.numAsteroidVerts; j++) {
        const xv = a.verts[j][0];
        const yv = a.verts[j][1];
        if (j === 0) {
          this.ctx.moveTo(xv, yv);
        } else {
          this.ctx.lineTo(xv, yv);
        }
      }
      this.ctx.closePath();

      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  private drawBullets() {
    for (let i = 0; i < this.player.bulletBodies.length; i++) {
      const bulletBody = this.player.bulletBodies[i];
      const x = bulletBody.body.interpolatedPosition[0];
      const y = bulletBody.body.interpolatedPosition[1];
      this.ctx.beginPath();
      this.ctx.arc(x, y, this.player.bulletRadius, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.closePath();
    }
  }

  private drawBounds() {
    this.ctx.beginPath();
    this.ctx.moveTo(- this.spaceWidth / 2, -this.spaceHeight / 2);
    this.ctx.lineTo(- this.spaceWidth / 2, this.spaceHeight / 2);
    this.ctx.lineTo(this.spaceWidth / 2, this.spaceHeight / 2);
    this.ctx.lineTo(this.spaceWidth / 2, -this.spaceHeight / 2);
    this.ctx.lineTo(- this.spaceWidth / 2, -this.spaceHeight / 2);
    this.ctx.closePath();
    this.ctx.stroke();
  }

  private updateLevel() {
    const el = document.getElementById('level');
    if (el) {
      el.innerHTML = 'Level ' + this.level;
    }
  }

  private updateLives() {
    const el = document.getElementById('lives');
    if (el) {
      el.innerHTML = 'Lives ' + this.player.lives;
    }
  }

  // Returns a random number between -0.5 and 0.5
  private rand() {
    return Math.random() - 0.5;
  }

  // Adds some asteroids to the scene.
  private addAsteroids() {
    for (let i = 0; i < this.level; i++) {
      const x = this.rand() * this.spaceWidth;
      let y = this.rand() * this.spaceHeight;
      const vx = this.rand() * this.maxAsteroidSpeed;
      const vy = this.rand() * this.maxAsteroidSpeed;
      const va = this.rand() * this.maxAsteroidSpeed;

      // Avoid the ship!
      if (Math.abs(x - this.player.body.position[0]) < this.initSpace) {
        if (y - this.player.body.position[1] > 0) {
          y += this.initSpace;
        } else {
          y -= this.initSpace;
        }
      }

      // Create asteroid body
      const asteroidBody = new p2.Body({
        mass: 10,
        position: [x, y],
        velocity: [vx, vy],
        angularVelocity: va
      });
      asteroidBody.damping = 0;
      asteroidBody.angularDamping = 0;

      asteroidBody.addShape(this.createAsteroidShape(0));
      const asteroid = { body: asteroidBody, level: 1, verts: [] } as Asteroids.Asteroid;
      this.asteroids.push(asteroid);
      this.addBodies.push(asteroid.body);
      this.addAsteroidVerts(asteroid);
    }
  }

  private createAsteroidShape(level: number) {
    const shape = new p2.Circle({
      radius: this.asteroidRadius * (this.numAsteroidLevels - level) / this.numAsteroidLevels,
      collisionGroup: this.ASTEROID, // Belongs to the ASTEROID group
      collisionMask: this.BULLET | this.SHIP // Can collide with the BULLET or SHIP group
    });
    return shape;
  }

  // Adds random .verts to an asteroid body
  private addAsteroidVerts(asteroidBody: Asteroids.Asteroid) {
    asteroidBody.verts = [];
    const radius = (asteroidBody.body.shapes[0] as p2.Circle).radius;
    for (let j = 0; j < this.numAsteroidVerts; j++) {
      const angle = j * 2 * Math.PI / this.numAsteroidVerts;
      const xv = radius * Math.cos(angle) + this.rand() * radius * 0.4;
      const yv = radius * Math.sin(angle) + this.rand() * radius * 0.4;
      asteroidBody.verts.push([xv, yv]);
    }
  }

  // Handle key up or down
  private handleKey(code: number, isDown: number) {
    switch (code) {
      case 32: this.keyShoot = isDown; break;
      case 37: this.keyLeft = isDown; break;
      case 38:
        this.keyUp = isDown;
        const instructions = document.getElementById('instructions');
        if (instructions) {
          instructions.classList.add('hidden')
        }
        break;
      case 39: this.keyRight = isDown; break;
    }
  }

  private explode(asteroidBody: Asteroids.Asteroid, bulletBody: Asteroids.Bullet) {
    const asteroidIndex = this.asteroids.indexOf(asteroidBody);
    const idx = this.player.bulletBodies.indexOf(bulletBody);
    if (asteroidIndex !== -1 && idx !== -1) {
      // Remove asteroid
      this.removeBodies.push(asteroidBody.body);
      this.asteroids.splice(asteroidIndex, 1);

      // Remove bullet
      this.removeBodies.push(bulletBody.body);

      this.player.bulletBodies.splice(idx, 1);

      // Add new sub-asteroids
      const x = asteroidBody.body.position[0];
      const y = asteroidBody.body.position[1];

      if (asteroidBody.level < 4) {
        const angleDisturb = Math.PI / 2 * Math.random();
        for (let i = 0; i < 4; i++) {
          const angle = Math.PI / 2 * i + angleDisturb;
          const shape = this.createAsteroidShape(asteroidBody.level);
          const r = (asteroidBody.body.shapes[0] as p2.Circle).radius - shape.radius;
          const subAsteroidBody = new p2.Body({
            mass: 10,
            position: [
              x + r * Math.cos(angle),
              y + r * Math.sin(angle)
            ],
            velocity: [this.rand(), this.rand()]
          });
          subAsteroidBody.damping = 0;
          subAsteroidBody.angularDamping = 0;

          subAsteroidBody.addShape(shape);
          this.addBodies.push(subAsteroidBody);
          const asteroid = { body: subAsteroidBody, level: asteroidBody.level + 1 } as Asteroids.Asteroid;
          this.addAsteroidVerts(asteroid);
          this.asteroids.push(asteroid);
        }
      }
    }

    if (this.asteroids.length === 0) {
      this.level++;
      this.updateLevel();
      this.addAsteroids();
    }
  }
}
