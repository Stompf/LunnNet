import * as Phaser from 'phaser-ce';
import { Player } from './player';
import { KeyMapping } from './key-mapping';
import { Bullet } from './bullet';
import { Asteroid } from './asteroid';
import { Events, resetEmitter, eventEmitter } from './events';
import { BasePowerUp, PowerUpShield, PowerUpShootSpeed } from './power-ups';
import { Utils } from './utils';
import { P2Sprite } from 'src/models';

export class AsteroidsGame {
    protected game: Phaser.Game;

    private readonly powerUpShieldPercent = 1;
    private readonly maxPowerUpsOnScreen = 2;

    private player!: Player;
    private INVULNERABLE = false;
    private SPAWN_ASTEROIDS = true;
    private readonly MAX_PLAYER_VELOCITY = 40;
    private readonly MAX_PHYSICS_VELOCITY = 20;
    private readonly PLAYER_RESPAWN_TIME = 1000;

    private currentLevel = 1;
    private powerUps: BasePowerUp[] = [];
    private readonly asteroidSpawnDelay = 14000;
    private asteroidSpawnTimer!: Phaser.Timer;

    private keyLeft = 0;
    private keyRight = 0;
    private keyUp = 0;
    private keyShoot = 0;

    private pointsText!: Phaser.Text;
    private livesText!: Phaser.Text;

    private gameOverGroup!: Phaser.Group;

    constructor(canvasId: string) {
        this.game = new Phaser.Game(1400, 600, Phaser.AUTO, canvasId, {
            preload: this.preload,
            create: this.create,
            update: this.update
        });
    }

    destroy() {
        resetEmitter();
        this.game.destroy();
    }

    private preload = () => {
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        this.game.load.image(
            'player',
            process.env.PUBLIC_URL + '/assets/games/asteroids/PNG/playerShip1_blue.png'
        );
        this.game.load.image(
            'ufo',
            process.env.PUBLIC_URL + '/assets/games/asteroids/PNG/ufoRed.png'
        );
        this.game.load.image(
            'powerUp_shootSpeed',
            process.env.PUBLIC_URL + '/assets/games/asteroids/PNG/Power-ups/powerUpBlue_bolt.png'
        );
        this.game.load.image(
            'powerUp_shield',
            process.env.PUBLIC_URL + '/assets/games/asteroids/PNG/Power-ups/powerUpBlue_shield.png'
        );
        this.game.load.image(
            'background',
            process.env.PUBLIC_URL + '/assets/games/asteroids/Backgrounds/space.jpg'
        );
    };

    private create = () => {
        this.initPixi();
        this.addBackground();
        this.addHUD();
        this.listenToEvents();
        this.createTimers();

        this.startNewGame();
    };

    private update = () => {
        this.updateKeys();
        this.updatePhysics();
        this.updateHUD();
    };

    private addBackground() {
        const background = this.game.add.tileSprite(
            0,
            0,
            this.game.width,
            this.game.height,
            'background'
        );
        background.anchor.set(0, 0);
    }

    private createTimers() {
        this.asteroidSpawnTimer = this.game.time.create(false);
        this.asteroidSpawnTimer.loop(
            this.asteroidSpawnDelay,
            () => {
                this.asteroidTick();
            },
            this
        );
    }

    private startNewGame() {
        this.game.input.onDown.remove(this.removeAllObjects, this);
        this.game.world.remove(this.gameOverGroup);

        this.player = new Player(this.game);
        this.addAsteroids();

        this.asteroidSpawnTimer.start();
    }

    private removeAllObjects() {
        this.game.world.removeChildren();
        this.game.physics.p2.clear();
        this.create();
    }

    private addHUD() {
        const pointsText = this.game.add.text(0, 0, 'Points: ', {
            fill: '#FFFFFF',
            fontSize: 12
        });
        pointsText.anchor.setTo(0, 0);

        const livesText = this.game.add.text(0, pointsText.height, 'Lives: ', {
            fill: '#FFFFFF',
            fontSize: 12
        });
        livesText.anchor.setTo(0, 0);

        this.pointsText = pointsText;
        this.livesText = livesText;
    }

    private updateHUD() {
        this.pointsText.setText('Points: ' + this.player.points);
        this.livesText.setText('Lives: ' + this.player.lives);
    }

    private listenToEvents() {
        eventEmitter.on(
            Events.AsteroidDestroyed,
            (asteroidBody: Phaser.Physics.P2.Body, bulletBody: Phaser.Physics.P2.Body) => {
                // Check if bullet or ship is already destroyed
                if (bulletBody.sprite == null || asteroidBody.sprite == null) {
                    return;
                }

                this.player.points += 10;

                // Remove bullet
                this.game.physics.p2.removeBodyNextStep(bulletBody);
                bulletBody.sprite.destroy();

                (asteroidBody.sprite.data as Asteroid).explode();

                if (
                    Math.random() <= this.powerUpShieldPercent &&
                    this.powerUps.length < this.maxPowerUpsOnScreen
                ) {
                    this.spawnRandomPowerUp(asteroidBody.sprite.position);
                }
                this.game.physics.p2.removeBodyNextStep(asteroidBody);
                asteroidBody.sprite.destroy();
            }
        );

        eventEmitter.on(Events.PowerUpActivated, (powerUp: BasePowerUp) => {
            const index = this.powerUps.indexOf(powerUp);
            if (index >= 0) {
                this.powerUps.splice(index, 1);
            }
        });

        eventEmitter.on(Events.AsteroidPlayerHit, () => {
            if (!this.player.sprite.visible || !this.player.allowCollision) {
                return;
            }

            this.player.lives--;
            this.player.sprite.visible = false;
            if (this.player.lives > 0) {
                const timer = this.game.time.create();
                timer.add(
                    this.PLAYER_RESPAWN_TIME,
                    () => {
                        this.respawnPlayer();
                    },
                    this
                );
                timer.start();
            } else {
                this.showGameOver();
            }
        });
    }

    private showGameOver() {
        this.asteroidSpawnTimer.stop();

        const group = this.game.add.group();

        const background = new Phaser.Graphics(this.game);
        background.beginFill(0x000000);
        background.drawRect(0, 0, this.game.width / 2, this.game.height / 2);
        background.endFill();

        const backgroundSprite = this.game.add.sprite(0, 0, background.generateTexture());

        group.add(backgroundSprite);
        group.position.set(this.game.width / 2, this.game.height / 2);

        const gameOverText = this.game.add.text(0, -backgroundSprite.height / 2, 'GAME OVER', {
            fill: '#FFFFFF',
            fontSize: 30
        });
        gameOverText.anchor.y = 0;
        group.add(gameOverText);

        const scoreText = this.game.add.text(0, 0, 'Final score: ' + this.player.points, {
            fill: '#FFFFFF',
            fontSize: 20
        });
        group.add(scoreText);

        const buttonGraphics = new Phaser.Graphics(this.game);
        buttonGraphics.lineStyle(5, 0xffffff);
        buttonGraphics.drawRect(0, 0, 125, 40);

        const playAgainText = this.game.add.text(
            0,
            background.height / 2 - 20,
            'Click to play again',
            {
                fill: '#FFFFFF',
                fontSize: 20
            }
        );
        playAgainText.inputEnabled = true;
        playAgainText.input.useHandCursor = true;
        playAgainText.events.onInputDown.add(this.removeAllObjects, this);
        group.add(playAgainText);

        this.game.input.onDown.add(this.removeAllObjects, this);

        this.gameOverGroup = group;
        this.game.world.bringToTop(group);
    }

    private respawnPlayer() {
        // Add ship again
        this.player.sprite.body.force[0] = 0;
        this.player.sprite.body.force[1] = 0;
        this.player.sprite.body.velocity[0] = 0;
        this.player.sprite.body.velocity[1] = 0;
        this.player.sprite.body.angularVelocity = 0;
        this.player.sprite.body.angle = 0;
        this.player.sprite.visible = true;

        // Spawn with shield
        const shield = new PowerUpShield(
            this.game,
            { x: this.player.sprite.body.x, y: this.player.sprite.body.y },
            this.player.sprite.body.velocity,
            this.player.sprite.body.angularVelocity
        );
        shield.activate(this.player);
    }

    private spawnRandomPowerUp(position: WebKitPoint) {
        const randomRoll = Math.random();
        let powerUp: BasePowerUp;
        if (randomRoll >= 0.5) {
            powerUp = new PowerUpShield(this.game, position, { x: 0, y: 0 }, 1);
        } else {
            powerUp = new PowerUpShootSpeed(this.game, position, { x: 0, y: 0 }, 1);
        }
        this.powerUps.push(powerUp);
    }

    private initPixi() {
        PIXI.Sprite.defaultAnchor = { x: 0.5, y: 0.5 };

        this.game.stage.backgroundColor = 0x000000;
        this.game.renderer.view.style.border = '1px solid black';
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.setImpactEvents(true);
        this.game.physics.p2.world.gravity = [0, 0];
        this.game.physics.p2.world.defaultContactMaterial.friction = 0;
    }

    private updatePhysics() {
        this.player.allowCollision =
            this.player.sprite.visible && !this.INVULNERABLE && !this.player.hasShield;

        // Thrust: add some force in the ship direction
        this.player.sprite.body.applyImpulseLocal([0, this.keyUp / 2], 0, 0);

        // Set turn velocity of ship
        this.player.sprite.body.angularVelocity =
            (this.keyRight - this.keyLeft) * this.player.turnSpeed;

        if (
            this.keyShoot &&
            this.player.sprite.visible &&
            this.game.physics.p2.world.time - this.player.lastShootTime > this.player.reloadTime
        ) {
            this.shoot();
        }

        // Warp all bodies
        this.game.world.children.forEach(child => {
            const sprite = child as P2Sprite;
            if (sprite.body != null && !(sprite.data instanceof Bullet)) {
                Utils.constrainVelocity(
                    sprite,
                    sprite === this.player.sprite
                        ? this.MAX_PLAYER_VELOCITY
                        : this.MAX_PHYSICS_VELOCITY
                );
                this.warp(sprite);
            }
        });
    }

    private shoot() {
        const angle = this.player.sprite.rotation - Math.PI / 2;

        const bullet = new Bullet(
            this.game,
            angle,
            { x: this.player.sprite.body.x, y: this.player.sprite.body.y },
            this.player.sprite.body.velocity
        );

        // Keep track of the last time we shot
        this.player.lastShootTime = this.game.physics.p2.world.time;

        return bullet;
    }

    private warp(sprite: P2Sprite) {
        const p = { x: sprite.x, y: sprite.y };
        if (p.x > this.game.width) {
            p.x = 0;
        }
        if (p.y > this.game.height) {
            p.y = 0;
        }
        if (p.x < 0) {
            p.x = this.game.width;
        }
        if (p.y < 0) {
            p.y = this.game.height;
        }

        // Set the previous position too, to not mess up the p2 body interpolation
        sprite.body.x = p.x;
        sprite.body.y = p.y;
    }

    // Adds some asteroids to the scene.
    private addAsteroids() {
        if (!this.SPAWN_ASTEROIDS) {
            return;
        }

        for (let i = 0; i < this.currentLevel; i++) {
            const x = Math.random() * this.game.width;
            let y = Math.random() * this.game.height;
            const vx = (Math.random() - 0.5) * Asteroid.MaxAsteroidSpeed;
            const vy = (Math.random() - 0.5) * Asteroid.MaxAsteroidSpeed;
            const va = (Math.random() - 0.5) * Asteroid.MaxAsteroidSpeed;

            // Avoid the ship!
            if (Math.abs(x - this.player.sprite.body.x) < Asteroid.InitSpace) {
                if (y - this.player.sprite.body.y > 0) {
                    y += Asteroid.InitSpace;
                } else {
                    y -= Asteroid.InitSpace;
                }
            }

            this.createAstroid({ x, y }, { x: vx, y: vy }, va);
        }
    }

    private createAstroid(position: WebKitPoint, velocity: WebKitPoint, va: number) {
        const asteroid = new Asteroid(this.game, position, velocity, va, 0);
        return asteroid;
    }

    private updateKeys() {
        this.keyUp = this.game.input.keyboard.isDown(KeyMapping.PlayerMapping.up) ? 1 : 0;
        this.keyRight = this.game.input.keyboard.isDown(KeyMapping.PlayerMapping.right) ? 1 : 0;
        this.keyLeft = this.game.input.keyboard.isDown(KeyMapping.PlayerMapping.left) ? 1 : 0;
        this.keyShoot = this.game.input.keyboard.isDown(KeyMapping.PlayerMapping.fire) ? 1 : 0;
    }

    private asteroidTick = () => {
        this.addAsteroids();
    };
}
