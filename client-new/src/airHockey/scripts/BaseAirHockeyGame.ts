export class BaseAirHockeyGame {
    protected app: PIXI.Application;
    protected container: PIXI.Container;

    initNewGame(app: PIXI.Application) {
        this.app = app;
        // Override
    }

    onClose() {
        // Override
    }

    onUpdate(_deltaTime: number) {
        // Override
    }
}