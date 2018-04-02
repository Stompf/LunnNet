import { AnimationManger } from './animation-manager';
import { MaleWeapons, MaleArmor } from './asset-loader';

enum CharacterAnimation {
    idle = 'idle',
    run = 'run',
    melee_swing = 'melee_swing',
    block = 'block',
    hit_and_die = 'hit_and_die',
    cast_spell = 'cast_spell',
    shoot_bow = 'shoot_bow'
}

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
            MaleArmor.steel_armor
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

            if (
                game.input.keyboard.isDown(Phaser.KeyCode.CONTROL) ||
                (game.input.activePointer.isMouse && game.input.mousePointer.rightButton.isDown) ||
                (game.input.pointer1.isDown && game.input.pointer2.isDown)
            ) {
                this.shoot();
            } else {
                this.move(game);
            }
        } else {
            this.setIdle();
        }
    }

    private shoot() {
        this.bodySprite.body.velocity.setTo(0, 0);
        this.setCharacterAnimation(CharacterAnimation.melee_swing);
    }

    private move(game: Phaser.Game) {
        if (Phaser.Rectangle.contains(this.bodySprite.body, game.input.x, game.input.y)) {
            this.setIdle();
        } else {
            this.setCharacterAnimation(CharacterAnimation.run);

            game.physics.arcade.moveToPointer(this.bodySprite, this.currentSpeed);
        }
    }

    private setIdle() {
        if (this.isIdle) {
            return;
        }

        this.setCharacterAnimation(CharacterAnimation.idle);

        this.bodySprite.body.velocity.setTo(0, 0);
        this.isIdle = true;
    }

    private addAnimations(sprite: Phaser.Sprite) {
        AnimationManger.addAnimation(CharacterAnimation.idle, [0, 1, 2, 3], sprite, 3);
        AnimationManger.addAnimation(
            CharacterAnimation.run,
            [4, 5, 6, 7, 8, 9, 10, 11],
            sprite,
            10
        );
        AnimationManger.addAnimation(CharacterAnimation.melee_swing, [12, 13, 14, 15], sprite, 6);
        AnimationManger.addAnimation(CharacterAnimation.block, [16, 17], sprite, 4);
        AnimationManger.addAnimation(
            CharacterAnimation.hit_and_die,
            [18, 19, 20, 21, 22, 23],
            sprite,
            4
        );
        AnimationManger.addAnimation(CharacterAnimation.cast_spell, [24, 25, 26, 27], sprite, 4);
        AnimationManger.addAnimation(CharacterAnimation.shoot_bow, [28, 29, 30, 31], sprite, 4);
    }

    private addHead(game: Phaser.Game) {
        const headSprite = game.add.sprite(0, 0, MaleArmor.head1);
        this.addAnimations(headSprite);

        this.bodySprite.addChild(headSprite);
        return headSprite;
    }

    private addWeapon(game: Phaser.Game) {
        const weaponSprite = game.add.sprite(0, 0, MaleWeapons.greatsword);
        this.addAnimations(weaponSprite);

        this.bodySprite.addChild(weaponSprite);
        return weaponSprite;
    }

    private setCharacterAnimation(animation: string) {
        this.bodySprite.animations.play(`${animation}_${this.currentDirection}`);
        this.headSprite.animations.play(`${animation}_${this.currentDirection}`);
        this.weaponSprite.animations.play(`${animation}_${this.currentDirection}`);
    }
}
