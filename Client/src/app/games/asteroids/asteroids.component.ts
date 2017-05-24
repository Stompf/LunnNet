import { Component, OnInit, OnDestroy } from '@angular/core';
import * as PIXI from 'pixi.js';
import * as p2 from 'p2';
import * as _ from 'lodash';
import { Player } from './scripts/Player';
import { Asteroid } from './scripts/Asteroid';
import { Bullet } from './scripts/Bullet';
import { LunnEngineComponent } from 'lunnEngine/LunnEngineComponent';
import { Sprites } from './scripts/Sprites';
import * as $ from 'jquery';

@Component({
  selector: 'app-asteroids',
  templateUrl: './asteroids.component.html',
  styleUrls: ['./asteroids.component.css']
})

export class AsteroidsComponent extends LunnEngineComponent implements OnInit, OnDestroy {
  player: Player;
  spaceWidth = 16;
  spaceHeight = 9;
  world: p2.World;
  bullets: Bullet[] = [];

  asteroids: Asteroid[] = [];
  asteroidsToAdd: Asteroid[] = [];
  asteroidsToRemove: Asteroid[] = [];

  currentLevel = 1;

  keyLeft = 0;
  keyRight = 0;
  keyUp = 0;
  keyShoot = 0;

  lastTime: number;
  maxSubSteps = 5; // Max physics ticks per render frame
  fixedDeltaTime = 1 / 30; // Physics "tick" delta time

  playerSprite: PIXI.Sprite;

  DRAW_BODIES = true;
  SPAWN_ASTEROIDS = true;

  private container: PIXI.Container;

  constructor() {
    super();
  }

  ngOnInit() {
    // Catch key down events
    window.onkeydown = (evt) => {
      this.handleKey(evt.keyCode, 1);
    }

    // Catch key up events
    window.onkeyup = (evt) => {
      this.handleKey(evt.keyCode, 0);
    }

    this.loadTextures().done(() => {
      this.initAsteroids();
      this.animate(0);
    });
  }

  ngOnDestroy() {
    this.destroy();
  }

  private loadTextures() {
    Sprites.MeteoroidSprites.clear();

    const deferred = $.Deferred();

    const playerTexture = this.loadTexture('player', 'assets/games/asteroids/PNG/playerShip1_blue.png').done(sprite => {
      if (sprite != null) {
        this.playerSprite = sprite;
      }
    });

    const meteorLevel0_0 = this.loadTexture('player', 'assets/games/asteroids/PNG/Meteors/meteorBrown_big1.png').done(sprite => {
      if (sprite != null) {
        Sprites.MeteoroidSprites.setValue(0, sprite);
      }
    });

    const meteorLevel0_1 = this.loadTexture('player', 'assets/games/asteroids/PNG/Meteors/meteorBrown_big2.png').done(sprite => {
      if (sprite != null) {
        Sprites.MeteoroidSprites.setValue(0, sprite);
      }
    });

    const meteorLevel1_0 = this.loadTexture('player', 'assets/games/asteroids/PNG/Meteors/meteorBrown_med1.png').done(sprite => {
      if (sprite != null) {
        Sprites.MeteoroidSprites.setValue(1, sprite);
      }
    });

    const meteorLevel1_1 = this.loadTexture('player', 'assets/games/asteroids/PNG/Meteors/meteorBrown_med3.png').done(sprite => {
      if (sprite != null) {
        Sprites.MeteoroidSprites.setValue(1, sprite);
      }
    });

    const meteorLevel2_0 = this.loadTexture('player', 'assets/games/asteroids/PNG/Meteors/meteorBrown_small1.png').done(sprite => {
      if (sprite != null) {
        Sprites.MeteoroidSprites.setValue(2, sprite);
      }
    });

    const meteorLevel2_1 = this.loadTexture('player', 'assets/games/asteroids/PNG/Meteors/meteorBrown_small2.png').done(sprite => {
      if (sprite != null) {
        Sprites.MeteoroidSprites.setValue(2, sprite);
      }
    });

    const meteorLevel3_0 = this.loadTexture('player', 'assets/games/asteroids/PNG/Meteors/meteorBrown_small1.png').done(sprite => {
      if (sprite != null) {
        Sprites.MeteoroidSprites.setValue(3, sprite);
      }
    });

    const meteorLevel3_1 = this.loadTexture('player', 'assets/games/asteroids/PNG/Meteors/meteorBrown_small2.png').done(sprite => {
      if (sprite != null) {
        Sprites.MeteoroidSprites.setValue(3, sprite);
      }
    });

    $.when(playerTexture,
      meteorLevel0_0, meteorLevel0_1, meteorLevel1_0, meteorLevel1_1,
      meteorLevel2_0, meteorLevel2_1, meteorLevel3_0, meteorLevel3_1).done(() => {
        deferred.resolve();
      });

    return deferred.promise();
  }

  private initAsteroids() {

    this.init(800, 600, { view: document.getElementById('canvas') as HTMLCanvasElement, backgroundColor: 0x000000 });

    this.container = new PIXI.Container();
    this.container.position.x = this.app.renderer.width / 2; // center at origin
    this.container.position.y = this.app.renderer.height / 2;

    let zoom = this.app.view.height / this.spaceHeight;
    if (this.app.view.width / this.spaceWidth < zoom) {
      zoom = this.app.view.width / this.spaceWidth;
    }

    this.container.scale.x = zoom;
    this.container.scale.y = -zoom;

    Sprites.MeteoroidSprites.values().forEach(sprite => {
      sprite.anchor.x = 0.5;
      sprite.anchor.y = 0.5;
      sprite.scale.x = 1 / this.container.scale.x;
      sprite.scale.y = -1 / this.container.scale.y;
    });

    // Init physics world
    this.world = new p2.World({
      gravity: [0, 0]
    });

    // Turn off friction, we don't need it.
    this.world.defaultContactMaterial.friction = 0;

    this.playerSprite.scale.x = 1 / this.container.scale.x;
    this.playerSprite.scale.y = 1 / this.container.scale.y;

    this.player = new Player(this.playerSprite);
    this.player.init(this.world, Player.SHIP, Asteroid.ASTEROID);
    this.container.addChild(this.player.sprite);

    if (this.DRAW_BODIES) {
      this.container.addChild(this.player.createBodyGraphics());
    }

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
      const foundBulletA = _.find(this.bullets, bullet => { return bullet.body === bodyA; });
      const foundBulletB = _.find(this.bullets, bullet => { return bullet.body === bodyB; });

      if (this.player.visible && this.player.allowCollision && (bodyA === this.player.body || bodyB === this.player.body)) {

        // Ship collided with something
        this.player.allowCollision = false;

        const otherBody = (bodyA === this.player.body ? bodyB : bodyA);
        const foundAsteroid = _.find(this.asteroids, asteroid => { return asteroid.body === otherBody; });


        if (foundAsteroid != null) {
          this.player.lives--;
          this.updateLives();

          // Remove the ship body for a while
          this.world.removeBody(this.player.body);
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
                    this.player.body.position[1], 2) < Asteroid.InitSpace) {

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
        const bullet = (foundBulletA ? foundBulletA : foundBulletB);
        const body = (bodyB === (bullet ? bullet.body : undefined) ? bodyA : bodyB);

        const collidedAsteroid = _.find(this.asteroids, asteroid => { return asteroid.body === body; })
        if (collidedAsteroid != null && bullet != null) {
          // Remove asteroid
          this.world.removeBody(collidedAsteroid.body);
          this.container.removeChild(collidedAsteroid.sprite);
          this.container.removeChild(collidedAsteroid.bodyGraphics);

          this.asteroids.splice(this.asteroids.indexOf(collidedAsteroid), 1);

          // Remove bullet
          this.world.removeBody(bullet.body);
          this.container.removeChild(bullet.graphics);

          this.bullets.splice(this.bullets.indexOf(bullet), 1);

          collidedAsteroid.explode(this.player.body.position).forEach(subAsteroid => {
            this.asteroids.push(subAsteroid);
            this.world.addBody(subAsteroid.body);
            this.container.addChild(subAsteroid.sprite);
            if (this.DRAW_BODIES) {
              this.container.addChild(subAsteroid.createBodyGraphics());
            }
          });

          if (this.asteroids.length === 0) {
            this.currentLevel++;
            this.updateLevel();
            this.addAsteroids();
          }
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
    this.render();
  }

  private updatePhysics(time: number) {
    this.player.allowCollision = true;

    if (this.keyShoot && this.player.visible && this.world.time - this.player.lastShootTime > this.player.reloadTime) {
      this.shoot();
    }

    for (let i = 0; i < this.bullets.length; i++) {
      const b = this.bullets[i];

      // If the bullet is old, delete it
      if (b.dieTime <= this.world.time) {
        this.bullets.splice(i, 1);
        this.world.removeBody(b.body);
        this.container.removeChild(b.graphics);
        i--;
        continue;
      }
    }

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

    const bullet = new Bullet(angle, this.player.body.position, this.player.body.velocity, this.world.time);
    this.bullets.push(bullet);
    this.world.addBody(bullet.body);
    this.container.addChild(bullet.graphics);

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


  private render() {
    // Draw all things
    this.updateShip();
    this.updateBullets();
    //  this.drawBounds();
    this.updateAsteroids();

    this.app.renderer.render(this.container);
  }

  private updateShip() {
    this.player.update();
  }

  private updateAsteroids() {
    this.asteroids.forEach(asteroid => {
      asteroid.update();
    });
  }

  private updateBullets() {
    this.bullets.forEach(bullet => {
      bullet.update();
    });
  }

  private updateLevel() {
    const el = document.getElementById('level');
    if (el) {
      el.innerHTML = 'Level ' + this.currentLevel;
    }
  }

  private updateLives() {
    const el = document.getElementById('lives');
    if (el) {
      el.innerHTML = 'Lives ' + this.player.lives;
    }
  }

  // Adds some asteroids to the scene.
  private addAsteroids() {
    if (!this.SPAWN_ASTEROIDS) {
      return;
    }

    for (let i = 0; i < this.currentLevel; i++) {
      const x = Math.random() * this.spaceWidth;
      let y = Math.random() * this.spaceHeight;
      const vx = Math.random() * Asteroid.MaxAsteroidSpeed;
      const vy = Math.random() * Asteroid.MaxAsteroidSpeed;
      const va = Math.random() * Asteroid.MaxAsteroidSpeed;

      // Avoid the ship!
      if (Math.abs(x - this.player.body.position[0]) < Asteroid.InitSpace) {
        if (y - this.player.body.position[1] > 0) {
          y += Asteroid.InitSpace;
        } else {
          y -= Asteroid.InitSpace;
        }
      }

      const asteroid = new Asteroid([x, y], [vx, vy], va, 0);
      this.asteroids.push(asteroid);
      this.world.addBody(asteroid.body);
      this.container.addChild(asteroid.sprite);

      if (this.DRAW_BODIES) {
        this.container.addChild(asteroid.createBodyGraphics());
      }
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
}
