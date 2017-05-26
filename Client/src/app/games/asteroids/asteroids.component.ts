import { Component, OnInit, OnDestroy } from '@angular/core';
import * as PIXI from 'pixi.js';
import * as p2 from 'p2';
import * as _ from 'lodash';
import { Player } from './scripts/Player';
import { Asteroid } from './scripts/Asteroid';
import { Bullet } from './scripts/Bullet';
import { LunnEngineComponent } from 'lunnEngine/LunnEngineComponent';
import * as $ from 'jquery';
import { Sprites } from './scripts/Sprites';
import * as PowerUps from './scripts/PowerUps';
import { Utils } from './scripts/Utils';
import { KeyMapping } from './scripts/KeyMapping';

@Component({
  selector: 'app-asteroids',
  templateUrl: './asteroids.component.html',
  styleUrls: ['./asteroids.component.css']
})

export class AsteroidsComponent extends LunnEngineComponent implements OnInit, OnDestroy {
  player: Player;
  spaceWidth = 20;
  spaceHeight = 10;
  world: p2.World;
  bullets: Bullet[] = [];
  powerUps: PowerUps.BasePowerUp[] = [];
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

  DRAW_COLLISION_BODIES = false;
  SPAWN_ASTEROIDS = true;

  private container: PIXI.Container;
  private animationFrame: number;
  private powerUpShieldPercent = 0.1;
  private maxPowerUpsOnScreen = 2;

  constructor() {
    super();
  }

  ngOnInit() {
    this.loadTextures().done(() => {
      this.initAsteroids();
      this.animate(0);
    });
  }

  ngOnDestroy() {
    this.destroy();
  }

  private loadTextures() {
    const deferred = $.Deferred();

    const playerTexture = this.loadTexture('player', 'assets/games/asteroids/PNG/playerShip1_blue.png').done(sprite => {
      if (sprite != null) {
        this.playerSprite = sprite;
      }
    });

    const powerUp_shootSpeed = this.loadTexture('powerUp_shootSpeed',
      'assets/games/asteroids/PNG/Power-ups/powerUpBlue_bolt.png').done(sprite => {
        if (sprite != null) {
          Sprites.PowerUps.ShootSpeed = sprite;
        }
      });

    const powerUp_shield = this.loadTexture('powerUp_shield',
      'assets/games/asteroids/PNG/Power-ups/powerUpBlue_shield.png').done(sprite => {
        if (sprite != null) {
          Sprites.PowerUps.Shield = sprite;
        }
      });

    $.when(playerTexture, powerUp_shootSpeed, powerUp_shield).done(() => {
      deferred.resolve();
    });

    return deferred.promise();
  }

  private setCanvasSize() {
    let height = $('body').height() - 25;
    let width = $('body').width();

    if (height < 30) {
      height = 30;
    }
    if (width < 30) {
      width = 30;
    }

    this.app.renderer.resize(width, height);

    this.container.position.x = this.app.renderer.width / 2; // center at origin
    this.container.position.y = this.app.renderer.height / 2;

    let zoom = this.app.renderer.height / this.spaceHeight;
    if (this.app.renderer.width / this.spaceWidth < zoom) {
      zoom = this.app.renderer.width / this.spaceWidth;
    }

    this.container.scale.x = zoom;
    this.container.scale.y = -zoom;

    if (this.player == null) {
      const playerWidth = this.app.renderer.width / 30;
      this.playerSprite.width = playerWidth / zoom;
      this.playerSprite.height = ((playerWidth / 1.5) / -zoom);

      Sprites.PowerUps.Shield.scale.x = 1 / zoom;
      Sprites.PowerUps.Shield.scale.y = 1 / -zoom;

      Sprites.PowerUps.ShootSpeed.scale.x = 1 / zoom;
      Sprites.PowerUps.ShootSpeed.scale.y = 1 / -zoom;

      const leftBound = new PIXI.Graphics();
      leftBound.lineStyle(1 / zoom, 0xFFFFFF);
      leftBound.moveTo(-this.spaceWidth / 2, -this.spaceHeight / 2);
      leftBound.lineTo(-this.spaceWidth / 2, this.spaceHeight / 2);
      this.container.addChild(leftBound);

      const rightBound = new PIXI.Graphics();
      rightBound.lineStyle(1 / zoom, 0xFFFFFF);
      rightBound.moveTo(this.spaceWidth / 2, -this.spaceHeight / 2);
      rightBound.lineTo(this.spaceWidth / 2, this.spaceHeight / 2);
      this.container.addChild(rightBound);

      const topBound = new PIXI.Graphics();
      topBound.lineStyle(1 / zoom, 0xFFFFFF);
      topBound.moveTo(-this.spaceWidth / 2, -this.spaceHeight / 2);
      topBound.lineTo(this.spaceWidth / 2, -this.spaceHeight / 2);
      this.container.addChild(topBound);

      const bottomBound = new PIXI.Graphics();
      bottomBound.lineStyle(1 / zoom, 0xFFFFFF);
      bottomBound.moveTo(this.spaceWidth / 2, this.spaceHeight / 2);
      bottomBound.lineTo(-this.spaceWidth / 2, this.spaceHeight / 2);
      this.container.addChild(bottomBound);
    }
  }

  private initAsteroids() {
    this.init(800, 600,
      { view: document.getElementById('canvas') as HTMLCanvasElement, backgroundColor: 0x000000 });

    this.container = new PIXI.Container();

    this.setCanvasSize();

    // Init physics world
    this.world = new p2.World({
      gravity: [0, 0]
    });

    // Turn off friction, we don't need it.
    this.world.defaultContactMaterial.friction = 0;

    this.player = new Player(this.playerSprite);
    this.player.init(this.world);
    this.container.addChild(this.player.sprite);

    if (this.DRAW_COLLISION_BODIES) {
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
    this.world.on('beginContact', (evt: p2.BeginContactEvent) => {
      if (evt.shapeA.collisionGroup === Utils.MASKS.POWER_UP && evt.shapeB.collisionGroup === Utils.MASKS.PLAYER) {
        this.handlePowerUpActivated(evt.bodyA);
        return;
      } else if (evt.shapeA.collisionGroup === Utils.MASKS.PLAYER && evt.shapeB.collisionGroup === Utils.MASKS.POWER_UP) {
        this.handlePowerUpActivated(evt.bodyB);
        return;
      }


      const foundBulletA = _.find(this.bullets, bullet => { return bullet.body === evt.bodyA; });
      const foundBulletB = _.find(this.bullets, bullet => { return bullet.body === evt.bodyB; });

      if (this.player.visible && this.player.allowCollision && (evt.bodyA === this.player.body || evt.bodyB === this.player.body)) {

        // Ship collided with something
        this.player.allowCollision = false;

        const otherBody = (evt.bodyA === this.player.body ? evt.bodyB : evt.bodyA);
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
        const body = (evt.bodyB === (bullet ? bullet.body : undefined) ? evt.bodyA : evt.bodyB);

        const collidedAsteroid = _.find(this.asteroids, asteroid => { return asteroid.body === body; })
        if (collidedAsteroid != null && bullet != null) {
          // Remove asteroid
          this.world.removeBody(collidedAsteroid.body);
          this.container.removeChild(collidedAsteroid.bodyGraphics);

          this.asteroids.splice(this.asteroids.indexOf(collidedAsteroid), 1);

          // Remove bullet
          this.world.removeBody(bullet.body);
          this.container.removeChild(bullet.graphics);

          this.bullets.splice(this.bullets.indexOf(bullet), 1);

          collidedAsteroid.explode().forEach(subAsteroid => {
            this.asteroids.push(subAsteroid);
            this.world.addBody(subAsteroid.body);
            this.container.addChild(subAsteroid.createBodyGraphics());
          });

          if (Math.random() <= this.powerUpShieldPercent && this.powerUps.length < this.maxPowerUpsOnScreen) {
            this.spawnRandomPowerUp(collidedAsteroid.body.position);
          }

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

    $(window).resize(() => {
      this.setCanvasSize();
    });
  }

  private handlePowerUpActivated(powerUpBody: p2.Body) {
    const foundPowerUp = _.find(this.powerUps, powerUp => { return powerUp.body === powerUpBody });

    if (foundPowerUp) {
      this.powerUps.splice(this.powerUps.indexOf(foundPowerUp), 1);
      this.world.removeBody(powerUpBody);
      this.container.removeChild(foundPowerUp.sprite);
      foundPowerUp.onActivate(this.player);
    }
  }

  private spawnRandomPowerUp(position: number[]) {

    const randomRoll = Math.random();
    let powerUp: PowerUps.BasePowerUp;
    if (randomRoll >= 0.5) {
      powerUp = new PowerUps.PowerUpShield(position, [0, 0], 1);
    } else {
      powerUp = new PowerUps.PowerUpShield(position, [0, 0], 1);
    }
    this.world.addBody(powerUp.body);
    this.container.addChild(powerUp.sprite);
    this.powerUps.push(powerUp);
  }

  // Animation loop
  private animate = (time: number) => {
    this.animationFrame = requestAnimationFrame(this.animate);

    this.updateKeys();
    this.updatePhysics(time);
    this.render();
  }

  private updatePhysics(time: number) {
    this.player.allowCollision = false;

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
    this.updatePowerUps();

    this.app.renderer.render(this.container);
  }

  private updateShip() {
    this.player.update();
  }

  private updatePowerUps() {
    this.powerUps.forEach(powerUp => {
      powerUp.update();
    });
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
      const x = (Math.random() - 0.5) * this.spaceWidth;
      let y = (Math.random() - 0.5) * this.spaceHeight;
      const vx = (Math.random() - 0.5) * Asteroid.MaxAsteroidSpeed;
      const vy = (Math.random() - 0.5) * Asteroid.MaxAsteroidSpeed;
      const va = (Math.random() - 0.5) * Asteroid.MaxAsteroidSpeed;

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
      this.container.addChild(asteroid.createBodyGraphics());
    }
  }

  private updateKeys() {
    this.keyUp = this.isKeyPressed(KeyMapping.Mapping.up) ? 1 : 0;
    this.keyRight = this.isKeyPressed(KeyMapping.Mapping.right) ? 1 : 0;
    this.keyLeft = this.isKeyPressed(KeyMapping.Mapping.left) ? 1 : 0;
    this.keyShoot = this.isKeyPressed(KeyMapping.Mapping.fire) ? 1 : 0;
  }
}
