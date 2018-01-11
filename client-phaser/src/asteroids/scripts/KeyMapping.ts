import * as Phaser from 'phaser-ce';

export namespace KeyMapping {

    export interface Mapping {
        up: number;
        down: number;
        left: number;
        right: number;
        fire: number;
    }

    export const PlayerMapping = {
        up: Phaser.Keyboard.UP,
        down: Phaser.Keyboard.DOWN,
        left: Phaser.Keyboard.LEFT,
        right: Phaser.Keyboard.RIGHT,
        fire: Phaser.Keyboard.SPACEBAR
    };
}
