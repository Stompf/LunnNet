import { AnimationManger } from './animation-manager';
import { AssetName } from './asset-loader';

export class Player {
    private bodySprite: Phaser.Sprite;
    private headSprite: Phaser.Sprite;
    private weaponSprite: Phaser.Sprite;

    private currentDirection = 0;
    private isIdle = true;
    private currentSpeed = 200;

    constructor(game: Phaser.Game) {
        this.bodySprite = game.add.sprite(
            game.world.centerX,
            game.world.centerY,
            AssetName.steel_armor
        );
        game.physics.enable(this.bodySprite, Phaser.Physics.ARCADE);
        this.addAnimations(this.bodySprite);
        this.headSprite = this.addHead(game);
        this.weaponSprite = this.addWeapon(game);

        this.setIdle();

        game.camera.follow(this.bodySprite);
    }

    update(game: Phaser.Game) {
        if (game.input.activePointer.isDown) {
            this.isIdle = false;

            const degrees = game.input.activePointer.position.angle(this.bodySprite.position, true);
            this.currentDirection = AnimationManger.setDirection(degrees);

            if (Phaser.Rectangle.contains(this.bodySprite.body, game.input.x, game.input.y)) {
                this.setIdle();
            } else {
                this.bodySprite.animations.play(`run_${this.currentDirection}`);
                this.headSprite.animations.play(`run_${this.currentDirection}`);
                this.weaponSprite.animations.play(`run_${this.currentDirection}`);

                game.physics.arcade.moveToPointer(this.bodySprite, this.currentSpeed);
            }
        } else if (!this.isIdle) {
            this.setIdle();
        }
    }

    private setIdle() {
        this.bodySprite.animations.play(`idle_${this.currentDirection}`);
        this.headSprite.animations.play(`idle_${this.currentDirection}`);
        this.weaponSprite.animations.play(`idle_${this.currentDirection}`);

        this.bodySprite.body.velocity.setTo(0, 0);
        this.isIdle = true;
    }

    private addAnimations(sprite: Phaser.Sprite) {
        AnimationManger.addAnimation('idle', [0, 1, 2, 3], sprite, 3);
        AnimationManger.addAnimation('run', [4, 5, 6, 7, 8, 9, 10, 11], sprite, 10);
        AnimationManger.addAnimation('melee_swing_', [12, 13, 14, 15], sprite, 6);
        AnimationManger.addAnimation('block', [16, 17], sprite, 4);
        AnimationManger.addAnimation('hit_and_die_', [18, 19, 20, 21, 22, 23], sprite, 4);
        AnimationManger.addAnimation('cast_spell_', [24, 25, 26, 27], sprite, 4);
        AnimationManger.addAnimation('shoot_bow_', [28, 29, 30, 31], sprite, 4);
    }

    private addHead(game: Phaser.Game) {
        const headSprite = game.add.sprite(0, 0, AssetName.male_head1);
        this.addAnimations(headSprite);

        this.bodySprite.addChild(headSprite);
        return headSprite;
    }

    private addWeapon(game: Phaser.Game) {
        const weaponSprite = game.add.sprite(0, 0, AssetName.greatsword);
        this.addAnimations(weaponSprite);

        this.bodySprite.addChild(weaponSprite);
        return weaponSprite;
    }
}
