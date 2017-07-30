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

    protected appendTextareaLine(text: string) {
        const textarea = document.getElementById('AirHockeyTextarea') as HTMLTextAreaElement;
        if (textarea != null) {
            textarea.value = text + '\n' + textarea.value;
        }
    }
}