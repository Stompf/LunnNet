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
  // Debug flags
  private DRAW_COLLISION_BODIES = false;
  private SPAWN_ASTEROIDS = true;
  private INVULNERABLE = false;

  private player: Player;
  private spaceWidth = 16;
  private spaceHeight = 9;
  private world: p2.World;
  private bullets: Bullet[] = [];
  private powerUps: PowerUps.BasePowerUp[] = [];
  private asteroids: Asteroid[] = [];

  private currentLevel = 1;
  private asteroidSpawnTimer = 14000;
  private asteroidSpawnReference: number;

  private keyLeft = 0;
  private keyRight = 0;
  private keyUp = 0;
  private keyShoot = 0;

  private lastTime: number;
  private maxSubSteps = 5; // Max physics ticks per render frame
  private fixedDeltaTime = 1 / 60; // Physics "tick" delta time

  private playerSprite: PIXI.Sprite;
  private background: PIXI.Sprite;
  private gameOverContainer: PIXI.Container;

  private container: PIXI.Container;
  private animationFrame: number;
  private powerUpShieldPercent = 1;
  private maxPowerUpsOnScreen = 2;
  private pointsText: PIXI.Text;
  private livesText: PIXI.Text;
  private readonly StatusTextsMarginLeft = 0.25;
  private readonly StatusTextsMarginTop = 5;

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

  private initGameOverStage() {
    const gameOverContainer = new PIXI.Container();

    const backgroundHeight = 4;
    const backgroundWidth = 4;
    const background = new PIXI.Graphics();
    background.beginFill(0x000000);
    background.drawRoundedRect(-backgroundWidth / 2, -backgroundHeight / 2, backgroundWidth, backgroundHeight, 0.5);
    gameOverContainer.addChild(background);

    const textStyle = new PIXI.TextStyle({
      fill: 0xFFFFFF,
      fontSize: 30
    });
    const gameOverText = new PIXI.Text('GAME OVER', textStyle);
    gameOverText.anchor.x = 0.5;
    gameOverText.anchor.y = 0.5;
    gameOverText.scale.x = 1 / this.app.stage.scale.x;
    gameOverText.scale.y = 1 / this.app.stage.scale.y;
    gameOverText.position.x = 0;
    gameOverText.position.y = backgroundHeight / 2 - gameOverText.height;
    gameOverContainer.addChild(gameOverText);

    this.gameOverContainer = gameOverContainer;
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

    const background = this.loadTexture('background',
      'assets/games/asteroids/Backgrounds/space.png').done(sprite => {
        if (sprite != null) {
          this.background = sprite;
        }
      });

    $.when(playerTexture, powerUp_shootSpeed, powerUp_shield, background).done(() => {
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

    this.app.stage.position.x = this.app.renderer.width / 2; // center at origin
    this.app.stage.position.y = this.app.renderer.height / 2;

    let zoom = this.app.renderer.height / this.spaceHeight;
    if (this.app.renderer.width / this.spaceWidth < zoom) {
      zoom = this.app.renderer.width / this.spaceWidth;
    }

    this.app.stage.scale.x = zoom;
    this.app.stage.scale.y = -zoom;

    this.background.scale.x = 1 / zoom;
    this.background.scale.y = 1 / -zoom;

    if (this.livesText != null) {
      this.livesText.scale.x = 1 / this.app.stage.scale.x;
      this.livesText.scale.y = 1 / this.app.stage.scale.y;
    }

    if (this.pointsText != null) {
      this.pointsText.scale.x = 1 / this.app.stage.scale.x;
      this.pointsText.scale.y = 1 / this.app.stage.scale.y;
      this.pointsText.y = this.livesText.y - this.livesText.height;
    }

    if (this.player == null) {
      const playerWidth = this.app.renderer.width / 30;
      this.playerSprite.width = playerWidth / zoom;
      this.playerSprite.height = ((playerWidth / 1.5) / -zoom);

      const powerUpWidth = this.app.renderer.width / 45;
      Sprites.PowerUps.Shield.width = powerUpWidth / zoom;
      Sprites.PowerUps.Shield.height = powerUpWidth / -zoom;
      Sprites.PowerUps.ShootSpeed.width = powerUpWidth / zoom;
      Sprites.PowerUps.ShootSpeed.height = powerUpWidth / -zoom;

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
    this.background.anchor.x = 0.5;
    this.background.anchor.y = 0.5;

    this.container.addChild(this.background);

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

    this.initStatusTexts();
    this.initGameOverStage();

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
      const foundBulletA = _.find(this.bullets, bullet => { return bullet.body === evt.bodyA; });
      const foundBulletB = _.find(this.bullets, bullet => { return bullet.body === evt.bodyB; });

      if (this.player.visible && this.player.allowCollision && (evt.bodyA === this.player.body || evt.bodyB === this.player.body)) {

        // Ship collided with something
        this.player.allowCollision = false;

        if (evt.shapeA.collisionGroup === Utils.MASKS.POWER_UP) {
          this.handlePowerUpActivated(evt.bodyA);
          return;
        } else if (evt.shapeB.collisionGroup === Utils.MASKS.POWER_UP) {
          this.handlePowerUpActivated(evt.bodyB);
          return;
        }

        const otherBody = (evt.bodyA === this.player.body ? evt.bodyB : evt.bodyA);
        const foundAsteroid = _.find(this.asteroids, asteroid => { return asteroid.body === otherBody; });

        if (foundAsteroid != null) {
          this.player.lives--;
          this.updateLives();

          // Remove the ship body for a while
          this.world.removeBody(this.player.body);
          this.player.visible = false;

          this.removeAsteroid(foundAsteroid);

          if (this.player.lives > 0) {
            setTimeout(() => {
              this.respawnPlayer();
            }, 1000);
          } else {
            window.clearInterval(this.asteroidSpawnReference);
          }
        }
      } else if (foundBulletA != null || foundBulletB != null) {

        // Bullet collided with something
        const bullet = (foundBulletA ? foundBulletA : foundBulletB);
        const body = (evt.bodyB === (bullet ? bullet.body : undefined) ? evt.bodyA : evt.bodyB);

        const collidedAsteroid = _.find(this.asteroids, asteroid => { return asteroid.body === body; })
        if (collidedAsteroid != null && bullet != null) {
          this.removeAsteroid(collidedAsteroid);
          this.player.points += 10;
          this.updatePoints();

          // Remove bullet
          this.world.removeBody(bullet.body);
          this.container.removeChild(bullet.graphics);

          this.bullets.splice(this.bullets.indexOf(bullet), 1);

          if (Math.random() <= this.powerUpShieldPercent && this.powerUps.length < this.maxPowerUpsOnScreen) {
            this.spawnRandomPowerUp(collidedAsteroid.body.position);
          }
        }
      }

    }, this);

    // Init asteroid shapes
    this.addAsteroids();

    // Update the text boxes
    this.updateLives();

    this.asteroidSpawnReference = window.setInterval(() => {
      this.asteroidTick();
    }, this.asteroidSpawnTimer);

    $(window).resize(() => {
      this.setCanvasSize();
    });

    this.app.stage.addChild(this.container);
    this.app.stage.addChild(this.gameOverContainer);
  }

  private removeAsteroid(asteroid: Asteroid) {
    this.world.removeBody(asteroid.body);
    this.container.removeChild(asteroid.bodyGraphics);
    this.asteroids.splice(this.asteroids.indexOf(asteroid), 1);

    asteroid.explode().forEach(subAsteroid => {
      this.asteroids.push(subAsteroid);
      this.world.addBody(subAsteroid.body);
      this.container.addChild(subAsteroid.createBodyGraphics());
    });
  }

  private initStatusTexts() {
    const textStyle = new PIXI.TextStyle({
      fill: '#FFFFFF',
      fontSize: 20
    });
    this.livesText = new PIXI.Text('Lives: ', textStyle);
    this.livesText.x = -this.spaceWidth / 2 + this.StatusTextsMarginLeft;
    this.livesText.y = this.spaceHeight - this.StatusTextsMarginTop;
    this.livesText.anchor.y = 0.5;
    this.livesText.scale.x = 1 / this.app.stage.scale.x;
    this.livesText.scale.y = 1 / this.app.stage.scale.y;
    this.container.addChild(this.livesText);

    this.updateLives();

    this.pointsText = new PIXI.Text(String(this.player.points), textStyle);
    this.pointsText.x = this.livesText.x;
    this.pointsText.y = this.livesText.y - this.livesText.height;
    this.pointsText.anchor = this.livesText.anchor;
    this.pointsText.scale = this.livesText.scale;
    this.container.addChild(this.pointsText);

    this.updatePoints();
  }

  private respawnPlayer() {
    // Add ship again
    this.player.body.force[0] = 0;
    this.player.body.force[1] = 0;
    this.player.body.velocity[0] = 0;
    this.player.body.velocity[1] = 0;
    this.player.body.angularVelocity = 0;
    this.player.body.angle = 0;
    this.player.visible = true;
    this.world.addBody(this.player.body);

    // Spawn with shield
    const shield = new PowerUps.PowerUpShield(this.player.body.interpolatedPosition,
      this.player.body.velocity, this.player.body.angularVelocity);
    shield.activate(this.player);
  }

  private handlePowerUpActivated(powerUpBody: p2.Body) {
    const foundPowerUp = _.find(this.powerUps, powerUp => { return powerUp.body === powerUpBody });

    if (foundPowerUp) {
      this.powerUps.splice(this.powerUps.indexOf(foundPowerUp), 1);
      this.world.removeBody(powerUpBody);
      this.container.removeChild(foundPowerUp.sprite);
      foundPowerUp.activate(this.player);
    }
  }

  private spawnRandomPowerUp(position: number[]) {
    const randomRoll = Math.random();
    let powerUp: PowerUps.BasePowerUp;
    if (randomRoll >= 0.5) {
      powerUp = new PowerUps.PowerUpShield(position, [0, 0], 1);
    } else {
      powerUp = new PowerUps.PowerUpShootSpeed(position, [0, 0], 1);
    }
    this.world.addBody(powerUp.body);
    this.container.addChild(powerUp.sprite);
    this.powerUps.push(powerUp);
  }

  // Animation loop
  private animate = (time: number) => {
    this.animationFrame = requestAnimationFrame(this.animate);

    this.gameOverContainer.visible = this.player.lives === 0;

    this.updateKeys();
    this.updatePhysics(time);
    this.render();
  }

  private updatePhysics(time: number) {
    this.player.allowCollision = !this.INVULNERABLE && !this.player.hasShield;

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

  private asteroidTick = () => {
    this.addAsteroids();
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
    this.updateAsteroids();
    this.updatePowerUps();

    this.app.renderer.render(this.app.stage);
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

  private addPlayerLife() {
    this.player.lives++;
    this.updateLives();
  }

  private updateLives() {
    if (this.livesText && this.player) {
      this.livesText.text = 'Lives: ' + this.player.lives;
    }
  }

  private updatePoints() {
    if (this.pointsText && this.player) {
      this.pointsText.text = 'Points: ' + this.player.points;

      if (this.player.points !== 0 && this.player.points % 1000 === 0) {
        this.addPlayerLife();
      }
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
