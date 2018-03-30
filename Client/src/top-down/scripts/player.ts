const IMG_SIZE = 32;
const DIRECTION = 0;

export class Player {
    sprite: Phaser.Sprite;

    constructor(game: Phaser.Game) {
        this.sprite = game.add.sprite(game.world.centerX, game.world.centerY, 'steel_armor');
        this.sprite.anchor.set(0.5, 0.5);
        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.addAnimations(this.sprite);

        this.sprite.animations.play('idle');

        game.camera.follow(this.sprite);
    }

    update(game: Phaser.Game) {
        if (game.input.mousePointer.isDown) {
            this.sprite.animations.play('run');
            game.physics.arcade.moveToPointer(this.sprite, 200);
            console.log(game.input.mousePointer.position.angle(this.sprite.position, false));

            if (Phaser.Rectangle.contains(this.sprite.body, game.input.x, game.input.y)) {
                this.setIdle();
            }
        } else {
            this.setIdle();
        }
    }

    private setIdle() {
        this.sprite.animations.play('idle');
        this.sprite.body.velocity.setTo(0, 0);
    }

    private addAnimations(sprite: Phaser.Sprite) {
        sprite.animations.add(
            'idle',
            [this.getFrame(0), this.getFrame(1), this.getFrame(2), this.getFrame(3)],
            3,
            true
        );

        sprite.animations.add(
            'run',
            [
                this.getFrame(4),
                this.getFrame(5),
                this.getFrame(6),
                this.getFrame(7),
                this.getFrame(8),
                this.getFrame(9),
                this.getFrame(10),
                this.getFrame(11)
            ],
            10,
            true
        );

        sprite.animations.add(
            'melee_swing',
            [this.getFrame(12), this.getFrame(13), this.getFrame(14), this.getFrame(15)],
            6,
            true
        );

        sprite.animations.add('block', [this.getFrame(16), this.getFrame(17)], 4, true);

        sprite.animations.add(
            'hit_and_die',
            [
                this.getFrame(18),
                this.getFrame(19),
                this.getFrame(20),
                this.getFrame(21),
                this.getFrame(22),
                this.getFrame(23)
            ],
            4,
            true
        );

        sprite.animations.add(
            'cast_spell',
            [this.getFrame(24), this.getFrame(25), this.getFrame(26), this.getFrame(27)],
            4,
            true
        );

        sprite.animations.add(
            'shoot_bow',
            [this.getFrame(28), this.getFrame(29), this.getFrame(30), this.getFrame(31)],
            4,
            true
        );
    }

    private getFrame(frame: number) {
        return frame + IMG_SIZE * DIRECTION;
    }
}
