import * as PIXI from 'pixi.js';
import * as $ from 'jquery';

export class LunnEngineComponent {
    protected app: PIXI.Application;

    constructor() {

    }

    init(width: number, height: number, options: PIXI.IApplicationOptions) {
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

    private unsubscribeEvents() {
        $(document).off('keydown', this.keydown);
        $(document).off('keyup', this.keyup);
        $(document).off('blur', this.onBlur);
    }

    protected keydown = (e: JQueryMouseEventObject) => {
        console.log('LunnEngineComponent - keydown: ' + e.which);
    }

    protected keyup = (e: JQueryMouseEventObject) => {
        console.log('LunnEngineComponent - keyup: ' + e.which);
    }

    protected onBlur = (e: JQueryMouseEventObject) => {
        console.log('LunnEngineComponent - onBlur: ' + e.which);
    }
}
