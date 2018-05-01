import * as Phaser from 'phaser-ce';

export namespace KeyMapping {
    export interface Mapping {
        left: number;
        right: number;
        fire: number;
    }

    export const Player1Mapping = {
        left: Phaser.Keyboard.A,
        right: Phaser.Keyboard.S,
        fire: Phaser.Keyboard.SPACEBAR
    };

    export const Player2Mapping = {
        left: Phaser.Keyboard.LEFT,
        right: Phaser.Keyboard.RIGHT,
        fire: Phaser.Keyboard.CONTROL
    };
}
