import * as Phaser from 'phaser-ce';

export namespace KeyMapping {
    export interface Mapping {
        up: number;
        down: number;
        left: number;
        right: number;
        fire: number;
    }

    export const Player1Mapping = {
        up: Phaser.Keyboard.W,
        down: Phaser.Keyboard.S,
        left: Phaser.Keyboard.A,
        right: Phaser.Keyboard.D,
        fire: Phaser.Keyboard.F
    };

    export const Player2Mapping = {
        up: Phaser.Keyboard.UP,
        down: Phaser.Keyboard.DOWN,
        left: Phaser.Keyboard.LEFT,
        right: Phaser.Keyboard.RIGHT,
        fire: Phaser.Keyboard.SPACEBAR
    };
}
