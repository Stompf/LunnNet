import * as PIXI from 'pixi.js';
import * as $ from 'jquery';
import { KeyboardStates } from './utils/KeyboardStates';
import { Utils } from './utils/Utils';

export class LunnEngineComponent {
    protected app: PIXI.Application;

    get UtilsHelper() {
        return Utils;
    }

    init(width: number, height: number, options: PIXI.ApplicationOptions) {
        this.app = new PIXI.Application(width, height, options);

        $(document).keydown(this.keydown);
        $(document).keyup(this.keyup);
        $(document).blur(this.onBlur);
    }

    destroy() {
        PIXI.loader.reset();
        this.app.destroy();
        this.unsubscribeEvents();
    }

    isKeyPressed(which: number) {
        return KeyboardStates.isKeyPressed(which);
    }

    loadTexture(name: string, path: string) {
        const deferred = $.Deferred<PIXI.Sprite>();
        new PIXI.loaders.Loader().add(name, path).load((_loader: PIXI.loaders.Loader, resource: any) => {
            const sprite = new PIXI.Sprite((resource[name] as PIXI.loaders.Resource).texture);
            deferred.resolve(sprite);
        });
        return deferred.promise();
    }

    private unsubscribeEvents() {
        $(document).off('keydown', this.keydown);
        $(document).off('keyup', this.keyup);
        $(document).off('blur', this.onBlur);
    }

    protected keydown = (e: JQuery.Event<HTMLElement, null>) => {
        KeyboardStates.keyPressed(e.which);
    }

    protected keyup = (e: JQuery.Event<HTMLElement, null>) => {
        KeyboardStates.keyReleased(e.which);
    }

    protected onBlur = (e: JQuery.Event<HTMLElement, null>) => {
        KeyboardStates.keyReleased(e.which);
    }
}