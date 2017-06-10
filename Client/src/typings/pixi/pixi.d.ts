import * as PIXI from 'pixi.js';

declare module 'pixi.js' {
    export class TilingSprite extends PIXI.Sprite {
        constructor(texture: PIXI.Texture, width: number, height: number);
        generateTilingTexture(forcePowerOfTwo: boolean): void;

        height: number;
        tilePosition: PIXI.Point;
        tileScale: PIXI.Point;
        tileScaleOffset: PIXI.Point;
        width: number;
    }
}