import * as Phaser from 'phaser-ce';

export namespace Utils {
    export const MASKS = {
        PLAYER: new Phaser.Physics.P2.CollisionGroup(Math.pow(2, 1)),
        BULLET: new Phaser.Physics.P2.CollisionGroup(Math.pow(2, 2)),
        ASTEROID: new Phaser.Physics.P2.CollisionGroup(Math.pow(2, 3)),
        POWER_UP: new Phaser.Physics.P2.CollisionGroup(Math.pow(2, 4))
    };

    export function constrainVelocity(sprite: Phaser.Sprite, maxVelocity: number) {
        let vx = sprite.body.data.velocity[0];
        let vy = sprite.body.data.velocity[1];

        let currVelocitySqr = vx * vx + vy * vy;

        if (currVelocitySqr > maxVelocity * maxVelocity) {
            const angle = Math.atan2(vy, vx);

            vx = Math.cos(angle) * maxVelocity;
            vy = Math.sin(angle) * maxVelocity;

            sprite.body.data.velocity[0] = vx;
            sprite.body.data.velocity[1] = vy;
        }
    }
}
