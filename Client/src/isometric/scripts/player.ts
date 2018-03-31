const IMG_SIZE = 32;

export class Player {
    sprite: Phaser.Sprite;

    currentDirection = 0;

    constructor(game: Phaser.Game) {
        this.sprite = game.add.sprite(game.world.centerX, game.world.centerY, 'steel_armor');
        this.sprite.anchor.set(0.5, 0.5);
        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.addAnimations(this.sprite);

        this.sprite.animations.play('idle');

        game.camera.follow(this.sprite);
    }

    update(game: Phaser.Game) {
        if (game.input.activePointer.isDown) {
            const degrees = game.input.activePointer.position.angle(this.sprite.position, true);
            this.currentDirection = this.setDirection(degrees);

            if (Phaser.Rectangle.contains(this.sprite.body, game.input.x, game.input.y)) {
                this.setIdle();
            } else {
                this.sprite.animations.play(`run_${this.currentDirection}`);
                game.physics.arcade.moveToPointer(this.sprite, 200);
            }
        } else {
            this.setIdle();
        }
    }

    private setDirection(degrees: number) {
        if (degrees >= -22.5 && degrees < 22.5) {
            return 0;
        } else if (degrees >= 22.5 && degrees < 67.5) {
            return 1;
        } else if (degrees >= 67.5 && degrees < 112.5) {
            return 2;
        } else if (degrees >= 112.5 && degrees < 157.5) {
            return 3;
        } else if (degrees >= 157.5 || degrees < -157.5) {
            return 4;
        } else if (degrees >= -157.5 && degrees < -112.5) {
            return 5;
        } else if (degrees >= -112.5 && degrees < -67.5) {
            return 6;
        } else {
            return 7;
        }
    }

    private setIdle() {
        this.sprite.animations.play(`idle_${this.currentDirection}`);
        this.sprite.body.velocity.setTo(0, 0);
    }

    private addAnimations(sprite: Phaser.Sprite) {
        for (let i = 0; i < 8; i++) {
            sprite.animations.add(
                `idle_${i}`,
                [
                    this.getFrame(0, i),
                    this.getFrame(1, i),
                    this.getFrame(2, i),
                    this.getFrame(3, i)
                ],
                3,
                true
            );
        }

        for (let i = 0; i < 8; i++) {
            sprite.animations.add(
                `run_${i}`,
                [
                    this.getFrame(4, i),
                    this.getFrame(5, i),
                    this.getFrame(6, i),
                    this.getFrame(7, i),
                    this.getFrame(8, i),
                    this.getFrame(9, i),
                    this.getFrame(10, i),
                    this.getFrame(11, i)
                ],
                10,
                true
            );
        }

        for (let i = 0; i < 8; i++) {
            sprite.animations.add(
                `melee_swing_${i}`,
                [
                    this.getFrame(12, i),
                    this.getFrame(13, i),
                    this.getFrame(14, i),
                    this.getFrame(15, i)
                ],
                6,
                true
            );
        }

        for (let i = 0; i < 8; i++) {
            sprite.animations.add('block', [this.getFrame(16, i), this.getFrame(17, i)], 4, true);
        }

        for (let i = 0; i < 8; i++) {
            sprite.animations.add(
                `hit_and_die_${i}`,
                [
                    this.getFrame(18, i),
                    this.getFrame(19, i),
                    this.getFrame(20, i),
                    this.getFrame(21, i),
                    this.getFrame(22, i),
                    this.getFrame(23, i)
                ],
                4,
                true
            );
        }

        for (let i = 0; i < 8; i++) {
            sprite.animations.add(
                `cast_spell_${i}`,
                [
                    this.getFrame(24, i),
                    this.getFrame(25, i),
                    this.getFrame(26, i),
                    this.getFrame(27, i)
                ],
                4,
                true
            );
        }

        for (let i = 0; i < 8; i++) {
            sprite.animations.add(
                `shoot_bow_${i}`,
                [
                    this.getFrame(28, i),
                    this.getFrame(29, i),
                    this.getFrame(30, i),
                    this.getFrame(31, i)
                ],
                4,
                true
            );
        }
    }

    private getFrame(frame: number, direction: number) {
        return frame + IMG_SIZE * direction;
    }
}
