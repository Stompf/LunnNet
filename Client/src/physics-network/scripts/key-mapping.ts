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
        up: Phaser.Keyboard.W,
        down: Phaser.Keyboard.S,
        left: Phaser.Keyboard.A,
        right: Phaser.Keyboard.D,
        fire: Phaser.Keyboard.F
    };
}
