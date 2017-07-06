// import { MultiDictionary } from 'typescript-collections';
import * as PIXI from 'pixi.js';

export namespace Sprites {

    export const PowerUps = {
        Shield: new PIXI.Sprite,
        ShootSpeed: new PIXI.Sprite
    };

    export function getCloneSprite(sprite: PIXI.Sprite) {
        const clone = new PIXI.Sprite(sprite.texture.clone());
        clone.scale = sprite.scale;
        return clone;
    }
}
