import * as Phaser from 'phaser-ce';
import { Player } from './Player';
import { KeyMapping } from './KeyMapping';
import { Bullet } from './Bullet';
import { Asteroid } from './Asteroid';
import { eventEmitter, Events } from './Events';
import { Point } from 'phaser-ce';
import { BasePowerUp, PowerUpShield, PowerUpShootSpeed } from './PowerUps';

export class AsteroidsGame {
    protected game: Phaser.Game;

    private readonly powerUpShieldPercent = 1;
    private readonly maxPowerUpsOnScreen = 2;

    private player: Player;
    private INVULNERABLE = false;
    private SPAWN_ASTEROIDS = true;
    private currentLevel = 1;
    private powerUps: PowerUps.BasePowerUp[] = [];

    private keyLeft = 0;
    private keyRight = 0;
    private keyUp = 0;
    private keyShoot = 0;

    constructor(canvasId: string) {
        this.game = new Phaser.Game(1400, 600, Phaser.AUTO, canvasId, { preload: this.preload, create: this.create, update: this.update });
    }

    destroy() {
        this.game.destroy();
    }

    private preload = () => {
        this.game.load.image('player', process.env.PUBLIC_URL + '/assets/games/asteroids/PNG/playerShip1_blue.png');
    }

    protected create = () => {
        this.initPixi();
        this.player = new Player(this.game);
        this.addAsteroids();
        this.listenToEvents();
    }

    private listenToEvents() {
        eventEmitter.on(Events.AsteroidDestroyed, (asteroidBody: Phaser.Physics.P2.Body, bulletBody: Phaser.Physics.P2.Body) => {
            this.player.points += 10;
            // this.updatePoints();

            // Remove bullet
            this.game.world.removeChild(bulletBody.sprite);

            if (Math.random() <= this.powerUpShieldPercent && this.powerUps.length < this.maxPowerUpsOnScreen) {
                this.spawnRandomPowerUp(asteroidBody.sprite.position);
            }
        });
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

    protected update = () => {
        this.updateKeys();
        this.updatePhysics();
    }

    protected initPixi() {
        PIXI.Sprite.defaultAnchor = { x: 0.5, y: 0.5 };

        this.game.stage.backgroundColor = 0x000000;
        this.game.renderer.view.style.border = '1px solid black';
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.setImpactEvents(true);
        this.game.physics.p2.world.gravity = [0, 0];
        this.game.physics.p2.restitution = 1;
        this.game.physics.p2.world.defaultContactMaterial.friction = 0;
    }

    private updatePhysics() {
        this.player.allowCollision = !this.INVULNERABLE && !this.player.hasShield;
        this.player.sprite.body.setZeroForce();

        // Thrust: add some force in the ship direction
        this.player.sprite.body.applyImpulseLocal([0, this.keyUp], 0, 0);

        // Set turn velocity of ship
        this.player.sprite.body.angularVelocity = (this.keyRight - this.keyLeft) * this.player.turnSpeed;

        if (this.keyShoot && this.player.visible && this.game.physics.p2.world.time - this.player.lastShootTime > this.player.reloadTime) {
            this.shoot();
        }

        // Warp all bodies
        this.game.world.children.forEach(child => {
            this.warp(child as Phaser.Sprite);
        });
    }

    private shoot() {
        const angle = this.player.sprite.rotation - Math.PI / 2;

        const bullet = new Bullet(
            this.game,
            angle,
            { x: this.player.sprite.body.x, y: this.player.sprite.body.y },
            this.player.sprite.body.velocity,
            this.game.physics.p2.world.time);

        // Keep track of the last time we shot
        this.player.lastShootTime = this.game.physics.p2.world.time;

        return bullet;
    }

    private warp(sprite: Phaser.Sprite) {
        const p = { x: sprite.x, y: sprite.y };
        if (p.x > this.game.width) { p.x = 0; }
        if (p.y > this.game.height) { p.y = 0; }
        if (p.x < 0) { p.x = this.game.width; }
        if (p.y < 0) { p.y = this.game.height; }

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
}