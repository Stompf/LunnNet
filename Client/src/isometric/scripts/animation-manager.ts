import { ArcadeSprite } from 'src/models';

const DIRECTIONS_COUNT = 7;
const TOTAL_FRAMES_PER_ROW = 32;

export const AnimationManger = {
    setDirection(degrees: number) {
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
    },

    addAnimation(
        name: string,
        frames: number[],
        sprite: ArcadeSprite,
        speed: number,
        noLoop?: boolean
    ) {
        for (let i = 0; i <= DIRECTIONS_COUNT; i++) {
            sprite.animations.add(
                `${name}_${i}`,
                frames.map(frame => this.getFrame(frame, i)),
                speed,
                !noLoop
            );
        }
    },

    getFrame(frame: number, direction: number) {
        return frame + TOTAL_FRAMES_PER_ROW * direction;
    }
};
