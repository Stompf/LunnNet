import * as Phaser from 'phaser-ce';
import * as _ from 'lodash';
import { Player } from './Player';
import { Asteroid } from './Asteroid';
import { Bullet } from './Bullet';
import * as PowerUps from './PowerUps';
import { Utils } from './Utils';
import { KeyMapping } from './KeyMapping';
import { Point } from 'phaser-ce';

export class AsteroidsGame {
    protected game: Phaser.Game;

    // Debug flags
    private SPAWN_ASTEROIDS = true;
    private INVULNERABLE = false;

    private player: Player;
    private readonly spaceWidth = 16;
    private readonly spaceHeight = 9;
    private bullets: Bullet[] = [];
    private powerUps: PowerUps.BasePowerUp[] = [];
    private asteroids: Asteroid[] = [];

    private currentLevel = 1;
    private readonly asteroidSpawnTimer = 14000;
    private asteroidSpawnReference: number;

    private keyLeft = 0;
    private keyRight = 0;
    private keyUp = 0;
    private keyShoot = 0;

    private gameOverContainer: Phaser.Group;

    // private container: Phaser.Group;
    private readonly powerUpShieldPercent = 1;
    private readonly maxPowerUpsOnScreen = 2;
    private pointsText: Phaser.Text;
    private livesText: Phaser.Text;
    // private readonly StatusTextsMarginLeft = 0.25;
    // private readonly StatusTextsMarginTop = 5;

    constructor(canvasId: string) {
        this.game = new Phaser.Game(800, 600, Phaser.AUTO, canvasId, { preload: this.preload, create: this.create, update: this.update });
        // this.loadTextures().done(() => {
        //     this.init(
        //         800,
        //         600,
        //         {
        //             view: document.getElementById('AsteroidsCanvas') as HTMLCanvasElement,
        //             backgroundColor: 0x000000
        //         });

        //     this.initAsteroids();

        //     $(window).resize(() => {
        //         this.setCanvasSize();
        //     });
        // });
    }

    onDestroy() {
        this.game.destroy();
    }

    private preload = () => {
        this.game.load.image('player', process.env.PUBLIC_URL + '/assets/games/asteroids/PNG/playerShip1_blue.png');
        this.game.load.image('ufo', process.env.PUBLIC_URL + '/assets/games/asteroids/PNG/ufoRed.png');
        this.game.load.image('powerUp_shootSpeed', process.env.PUBLIC_URL + '/assets/games/asteroids/PNG/Power-ups/powerUpBlue_bolt.png');
        this.game.load.image('powerUp_shield', process.env.PUBLIC_URL + '/assets/games/asteroids/PNG/Power-ups/powerUpBlue_shield.png');
        this.game.load.image('background', process.env.PUBLIC_URL + '/assets/games/asteroids/Backgrounds/space.jpg');
    }

    protected create = () => {
        this.initPixi();
        this.initAsteroids();
    }

    protected update = () => {
        this.updateKeys();
        this.updatePhysics(this.game.physics.p2.world.time);

        // Thrust: add some force in the ship direction
        this.player.sprite.body.applyForce([0, this.keyUp * 2], 0, 0);

        // Set turn velocity of ship
        this.player.sprite.body.angularVelocity = (this.keyLeft - this.keyRight) * this.player.turnSpeed;
    }

    protected initPixi() {
        PIXI.Sprite.defaultAnchor = { x: 0.5, y: 0.5 };

        this.game.stage.backgroundColor = 0xFFFFFF;
        this.game.renderer.view.style.border = '1px solid black';
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.world.gravity = [0, 0];
        this.game.physics.p2.world.defaultContactMaterial.friction = 0;
        this.game.physics.p2.restitution = 1;
    }

    private setCanvasSize() {
        let { height, width } = this.game.canvas.getBoundingClientRect();

        height = height ? height : 0;
        width = width ? width : 0;

        height -= 25;

        if (height < 30) {
            height = 30;
        }
        if (width < 30) {
            width = 30;
        }

        this.game.renderer.resize(width, height);

        let zoom = this.game.renderer.height / this.spaceHeight;
        if (this.game.renderer.width / this.spaceWidth < zoom) {
            zoom = this.game.renderer.width / this.spaceWidth;
        }

        this.game.stage.scale.x = zoom;
        this.game.stage.scale.y = -zoom;

        // this.background.scale.x = 1 / zoom;
        // this.background.scale.y = 1 / -zoom;
        // this.background.width = width;
        // this.background.height = height;

        if (this.livesText != null) {
            this.livesText.scale.x = 1 / this.game.stage.scale.x;
            this.livesText.scale.y = 1 / this.game.stage.scale.y;
        }

        if (this.pointsText != null) {
            this.pointsText.scale.x = 1 / this.game.stage.scale.x;
            this.pointsText.scale.y = 1 / this.game.stage.scale.y;
            this.pointsText.y = this.livesText.y - this.livesText.height;
        }

        // if (this.player == null) {
        const playerWidth = this.game.renderer.width / 30;
        this.player.sprite.width = playerWidth / zoom;
        this.player.sprite.height = ((playerWidth / 1.5) / -zoom);

        // const powerUpWidth = this.game.renderer.width / 45;
        // Sprites.PowerUps.Shield.width = powerUpWidth / zoom;
        // Sprites.PowerUps.Shield.height = powerUpWidth / -zoom;
        // Sprites.PowerUps.ShootSpeed.width = powerUpWidth / zoom;
        // Sprites.PowerUps.ShootSpeed.height = powerUpWidth / -zoom;

        const leftBound = new Phaser.Graphics(this.game);
        leftBound.lineStyle(1 / zoom, 0x000000);
        leftBound.moveTo(-this.spaceWidth / 2, -this.spaceHeight / 2);
        leftBound.lineTo(-this.spaceWidth / 2, this.spaceHeight / 2);

        const rightBound = new Phaser.Graphics(this.game);
        rightBound.lineStyle(1 / zoom, 0x000000);
        rightBound.moveTo(this.spaceWidth / 2, -this.spaceHeight / 2);
        rightBound.lineTo(this.spaceWidth / 2, this.spaceHeight / 2);

        const topBound = new Phaser.Graphics(this.game);
        topBound.lineStyle(1 / zoom, 0x000000);
        topBound.moveTo(-this.spaceWidth / 2, -this.spaceHeight / 2);
        topBound.lineTo(this.spaceWidth / 2, -this.spaceHeight / 2);

        const bottomBound = new Phaser.Graphics(this.game);
        bottomBound.lineStyle(1 / zoom, 0x000000);
        bottomBound.moveTo(this.spaceWidth / 2, this.spaceHeight / 2);
        bottomBound.lineTo(-this.spaceWidth / 2, this.spaceHeight / 2);
        // } else {
        //     this.setGameOverStage();
        // }
    }

    private initAsteroids() {
        this.asteroids = [];
        this.bullets = [];
        this.powerUps = [];

        this.game.stage.removeChildren();
        // this.container = new Phaser.Group(this.game);

        // this.container.addChild(this.background);
        this.game.add.sprite(0, 0, 'background');

        this.player = new Player(this.game);
        this.setCanvasSize();

        // this.initStatusTexts();
        // this.setGameOverStage();

        // Catch impacts in the world
        // Todo: check if several bullets hit the same asteroid in the same time step
        this.game.physics.p2.world.on('beginContact', (evt: any) => {
            const foundBulletA = _.find(this.bullets, bullet => { return bullet.graphics.body === evt.bodyA; });
            const foundBulletB = _.find(this.bullets, bullet => { return bullet.graphics.body === evt.bodyB; });

            if (this.player.visible && this.player.allowCollision && (evt.bodyA === this.player.sprite.body || evt.bodyB === this.player.sprite.body)) {

                // Ship collided with something
                this.player.allowCollision = false;

                if (evt.shapeA.collisionGroup === Utils.MASKS.POWER_UP) {
                    this.handlePowerUpActivated(evt.bodyA);
                    return;
                } else if (evt.shapeB.collisionGroup === Utils.MASKS.POWER_UP) {
                    this.handlePowerUpActivated(evt.bodyB);
                    return;
                }

                const otherBody = (evt.bodyA === this.player.sprite.body ? evt.bodyB : evt.bodyA);
                const foundAsteroid = _.find(this.asteroids, asteroid => { return asteroid.graphics.body === otherBody; });

                if (foundAsteroid != null) {
                    this.player.lives--;
                    this.updateLives();

                    // Remove the ship body for a while
                    this.player.visible = false;

                    this.removeAsteroid(foundAsteroid);

                    if (this.player.lives > 0) {
                        setTimeout(() => {
                            this.respawnPlayer();
                        }, 1000);
                    } else {
                        window.clearInterval(this.asteroidSpawnReference);
                        // this.setGameOverStage();
                        this.game.stage.addChild(this.gameOverContainer);
                    }
                }
            } else if (foundBulletA != null || foundBulletB != null) {

                // Bullet collided with something
                const bullet = (foundBulletA ? foundBulletA : foundBulletB);
                const body = (evt.bodyB === (bullet ? bullet.graphics.body : undefined) ? evt.bodyA : evt.bodyB);

                const collidedAsteroid = _.find(this.asteroids, asteroid => { return asteroid.graphics.body === body; });
                if (collidedAsteroid != null && bullet != null) {
                    this.removeAsteroid(collidedAsteroid);
                    this.player.points += 10;
                    this.updatePoints();

                    // Remove bullet
                    this.game.stage.removeChild(bullet.graphics);

                    this.bullets.splice(this.bullets.indexOf(bullet), 1);

                    if (Math.random() <= this.powerUpShieldPercent && this.powerUps.length < this.maxPowerUpsOnScreen) {
                        this.spawnRandomPowerUp(collidedAsteroid.graphics.position);
                    }
                }
            }

        }, this);

        // Init asteroid shapes
        this.addAsteroids();

        // Update the text boxes
        this.updateLives();

        this.asteroidSpawnReference = window.setInterval(() => {
            if (document.hasFocus()) {
                this.asteroidTick();
            }
        }, this.asteroidSpawnTimer);
    }

    private removeAsteroid(asteroid: Asteroid) {
        this.game.stage.removeChild(asteroid.graphics);
        // this.container.removeChild(asteroid.graphics);
        this.asteroids.splice(this.asteroids.indexOf(asteroid), 1);

        asteroid.explode().forEach(subAsteroid => {
            this.asteroids.push(subAsteroid);
        });
    }

    // private setGameOverStage() {
    //     const gameOverContainer = new PIXI.Container();

    //     const backgroundHeight = 4;
    //     const backgroundWidth = 7;
    //     const background = new PIXI.Graphics();
    //     background.beginFill(0x000000);
    //     background.drawRoundedRect(-backgroundWidth / 2, -backgroundHeight / 2, backgroundWidth, backgroundHeight, 0.5);
    //     gameOverContainer.addChild(background);

    //     const textStyle = new PIXI.TextStyle({
    //         fill: 0xFFFFFF,
    //         fontSize: 30
    //     });
    //     const gameOverText = new PIXI.Text('GAME OVER', textStyle);
    //     gameOverText.anchor.x = 0.5;
    //     gameOverText.anchor.y = 0.5;
    //     gameOverText.scale.x = 1 / this.app.stage.scale.x;
    //     gameOverText.scale.y = 1 / this.app.stage.scale.y;
    //     gameOverText.position.x = 0;
    //     gameOverText.position.y = backgroundHeight / 2 - gameOverText.height;
    //     gameOverContainer.addChild(gameOverText);

    //     const scoreStyle = new PIXI.TextStyle({
    //         fill: 0xFFFFFF,
    //         fontSize: 20
    //     });
    //     const scoreText = new PIXI.Text('Final score: ' + this.player.points, scoreStyle);
    //     scoreText.anchor.x = 0.5;
    //     scoreText.anchor.y = 0.5;
    //     scoreText.scale.x = 1 / this.app.stage.scale.x;
    //     scoreText.scale.y = 1 / this.app.stage.scale.y;
    //     scoreText.position.x = 0;
    //     scoreText.position.y = 0;
    //     gameOverContainer.addChild(scoreText);

    //     const buttonWidth = 2.5;
    //     const buttonHeight = 0.7;
    //     const button = new PIXI.Graphics();
    //     button.interactive = true;
    //     button.buttonMode = true;
    //     button.cursor = 'pointer';
    //     button.lineStyle(0.05, 0xFFFFFF);
    //     const tryAgainButtonHitArea = new PIXI.Rectangle(-buttonWidth / 2, -gameOverText.position.y,
    //         buttonWidth, buttonHeight);
    //     button.hitArea = tryAgainButtonHitArea;

    //     button.moveTo(tryAgainButtonHitArea.x, tryAgainButtonHitArea.y);
    //     button.lineTo(tryAgainButtonHitArea.x, tryAgainButtonHitArea.y + tryAgainButtonHitArea.height);
    //     button.lineTo(tryAgainButtonHitArea.x + tryAgainButtonHitArea.width, tryAgainButtonHitArea.y + tryAgainButtonHitArea.height);
    //     button.lineTo(tryAgainButtonHitArea.x + tryAgainButtonHitArea.width, tryAgainButtonHitArea.y);
    //     button.lineTo(tryAgainButtonHitArea.x, tryAgainButtonHitArea.y);

    //     button.on('mousedown', () => { this.initAsteroids(); }, false);

    //     const playAgainText = new PIXI.Text('Play Again');
    //     playAgainText.style.fill = 0xFFFFFF;
    //     playAgainText.style.fontSize = 20;
    //     playAgainText.scale.x = 1 / this.app.stage.scale.x;
    //     playAgainText.scale.y = 1 / this.app.stage.scale.y;
    //     playAgainText.anchor.x = 0.5;
    //     playAgainText.anchor.y = 0.5;
    //     playAgainText.position.y = tryAgainButtonHitArea.y + tryAgainButtonHitArea.height / 2;

    //     button.addChild(playAgainText);

    //     gameOverContainer.addChild(button);

    //     this.gameOverContainer = gameOverContainer;
    // }

    // private initStatusTexts() {
    //     const textStyle = new PIXI.TextStyle({
    //         fill: '#FFFFFF',
    //         fontSize: 20
    //     });
    //     this.livesText = new PIXI.Text('Lives: ', textStyle);
    //     this.livesText.x = -this.spaceWidth / 2 + this.StatusTextsMarginLeft;
    //     this.livesText.y = this.spaceHeight - this.StatusTextsMarginTop;
    //     this.livesText.anchor.y = 0.5;
    //     this.livesText.scale.x = 1 / this.app.stage.scale.x;
    //     this.livesText.scale.y = 1 / this.app.stage.scale.y;
    //     this.container.addChild(this.livesText);

    //     this.updateLives();

    //     this.pointsText = new PIXI.Text(String(this.player.points), textStyle);
    //     this.pointsText.x = this.livesText.x;
    //     this.pointsText.y = this.livesText.y - this.livesText.height;
    //     this.pointsText.anchor = this.livesText.anchor;
    //     this.pointsText.scale = this.livesText.scale;
    //     this.container.addChild(this.pointsText);

    //     this.updatePoints();
    // }

    private respawnPlayer() {
        // Add ship again
        this.player.sprite.body.force[0] = 0;
        this.player.sprite.body.force[1] = 0;
        this.player.sprite.body.velocity[0] = 0;
        this.player.sprite.body.velocity[1] = 0;
        this.player.sprite.body.angularVelocity = 0;
        this.player.sprite.body.angle = 0;
        this.player.visible = true;

        // Spawn with shield
        const shield = new PowerUps.PowerUpShield(this.game, this.player.sprite.position,
            this.player.sprite.body.velocity, this.player.sprite.body.angularVelocity);
        shield.activate(this.player);
    }

    private handlePowerUpActivated(powerUpBody: Phaser.Sprite) {
        const foundPowerUp = _.find(this.powerUps, powerUp => { return powerUp.sprite === powerUpBody; });

        if (foundPowerUp) {
            this.powerUps.splice(this.powerUps.indexOf(foundPowerUp), 1);
            this.game.stage.removeChild(foundPowerUp.sprite);
            foundPowerUp.activate(this.player);
        }
    }

    private spawnRandomPowerUp(position: Point) {
        const randomRoll = Math.random();
        let powerUp: PowerUps.BasePowerUp;
        if (randomRoll >= 0.5) {
            powerUp = new PowerUps.PowerUpShield(this.game, position, { x: 0, y: 0 }, 1);
        } else {
            powerUp = new PowerUps.PowerUpShootSpeed(this.game, position, { x: 0, y: 0 }, 1);
        }
        this.powerUps.push(powerUp);
    }

    private updatePhysics(time: number) {
        this.player.allowCollision = !this.INVULNERABLE && !this.player.hasShield;

        if (this.keyShoot && this.player.visible && this.game.physics.p2.world.time - this.player.lastShootTime > this.player.reloadTime) {
            this.shoot();
        }

        for (let i = 0; i < this.bullets.length; i++) {
            const b = this.bullets[i];

            // If the bullet is old, delete it
            if (b.dieTime <= this.game.physics.p2.world.time) {
                this.bullets.splice(i, 1);
                this.game.stage.removeChild(b.graphics);
                i--;
                continue;
            }
        }

        // Warp all bodies
        for (let i = 0; i < this.game.physics.p2.world.bodies.length; i++) {
            this.warp(this.game.physics.p2.world.bodies[i]);
        }
    }

    private asteroidTick = () => {
        this.addAsteroids();
    }

    private shoot() {
        const angle = this.player.sprite.body.angle + Math.PI / 2;

        const bullet = new Bullet(
            this.game,
            angle,
            this.player.sprite.position,
            this.player.sprite.body.velocity,
            this.game.physics.p2.world.time);

        this.bullets.push(bullet);

        // Keep track of the last time we shot
        this.player.lastShootTime = this.game.physics.p2.world.time;
    }

    // If the body is out of space bounds, warp it to the other side
    private warp(body: p2.Body) {
        const p = body.position;
        if (p[0] > this.spaceWidth / 2) { p[0] = -this.spaceWidth / 2; }
        if (p[1] > this.spaceHeight / 2) { p[1] = -this.spaceHeight / 2; }
        if (p[0] < -this.spaceWidth / 2) { p[0] = this.spaceWidth / 2; }
        if (p[1] < -this.spaceHeight / 2) { p[1] = this.spaceHeight / 2; }

        // Set the previous position too, to not mess up the p2 body interpolation
        body.previousPosition[0] = p[0];
        body.previousPosition[1] = p[1];
    }

    // private render() {
    //     // Draw all things
    //     this.updateShip();
    //     this.updateBullets();
    //     this.updateAsteroids();
    //     this.updatePowerUps();

    //     this.app.renderer.render(this.app.stage);
    // }

    // private updateShip() {
    //     this.player.update();
    // }

    // private updatePowerUps() {
    //     this.powerUps.forEach(powerUp => {
    //         powerUp.update();
    //     });
    // }

    // private updateAsteroids() {
    //     this.asteroids.forEach(asteroid => {
    //         asteroid.update();
    //     });
    // }

    // private updateBullets() {
    //     this.bullets.forEach(bullet => {
    //         bullet.update();
    //     });
    // }

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
            if (Math.abs(x - this.player.sprite.position.x) < Asteroid.InitSpace) {
                if (y - this.player.sprite.position.y > 0) {
                    y += Asteroid.InitSpace;
                } else {
                    y -= Asteroid.InitSpace;
                }
            }

            const asteroid = new Asteroid(this.game, [x, y], [vx, vy], va, 0);
            this.asteroids.push(asteroid);
        }
    }

    private updateKeys() {
        this.keyUp = this.game.input.keyboard.isDown(KeyMapping.PlayerMapping.up) ? 1 : 0;
        this.keyRight = this.game.input.keyboard.isDown(KeyMapping.PlayerMapping.right) ? 1 : 0;
        this.keyLeft = this.game.input.keyboard.isDown(KeyMapping.PlayerMapping.left) ? 1 : 0;
        this.keyShoot = this.game.input.keyboard.isDown(KeyMapping.PlayerMapping.fire) ? 1 : 0;
    }
}
