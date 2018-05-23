import { PlayerOptions } from 'src/achtung-kurve/models';

export const PLAYER_COLORS = [
    0xff4136,
    0x0074d9,
    0x7fdbff,
    0x01ff70,
    0xffdc00,
    0xb10dc9,
    0xf012be,
    0x2ecc40
];

export const DEFAULT_PLAYER_OPTIONS: PlayerOptions = {
    color: PLAYER_COLORS[0],
    diameter: 10,
    id: '',
    position: { x: 0, y: 0 },
    speed: 150,
    movement: 0
};
