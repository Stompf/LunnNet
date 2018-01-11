import * as Phaser from 'phaser-ce';

export namespace Utils {

    export const MASKS = {
        PLAYER: new Phaser.Physics.P2.CollisionGroup(Math.pow(2, 1)),
        BULLET: new Phaser.Physics.P2.CollisionGroup(Math.pow(2, 2)),
        ASTEROID: new Phaser.Physics.P2.CollisionGroup(Math.pow(2, 3)),
        POWER_UP: new Phaser.Physics.P2.CollisionGroup(Math.pow(2, 4))
    };
}
