import { LunnEngineComponent } from '../../lunnEngine/LunnEngineComponent';
import { NetworkGame } from './NetworkGame';
import { LocalGame } from './LocalGame';
import { BaseAirHockeyGame } from './BaseAirHockeyGame';

export class AirHockeyGame extends LunnEngineComponent {
    private baseAirHockeyGame: BaseAirHockeyGame;

    private USE_NETWORK: boolean = false;
    private lastTime: number;
    private animationFrame: number;

    constructor() {
        super();
    }

    onInit() {
        this.init(800, 600,
            { view: document.getElementById('AirHockeyCanvas') as HTMLCanvasElement, backgroundColor: 0xFFFFFF });

        if (this.USE_NETWORK) {
            this.baseAirHockeyGame = new NetworkGame();
        } else {
            this.baseAirHockeyGame = new LocalGame();
        }

        this.startAnimation();
    }

    onDestroy(): void {
        cancelAnimationFrame(this.animationFrame);

        if (this.baseAirHockeyGame) {
            this.baseAirHockeyGame.onClose();
        }
        this.destroy();
    }

    private startAnimation() {
        this.lastTime = 0;
        this.baseAirHockeyGame.initNewGame(this.app);

        this.animate(0);
    }

    private animate = (time: number) => {
        this.animationFrame = requestAnimationFrame(this.animate);

        if (!document.hasFocus()) {
            return;
        }

        if (this.baseAirHockeyGame) {
            // Get the elapsed time since last frame, in seconds
            let deltaTime = this.lastTime !== 0 ? (time - this.lastTime) / 1000 : 0;
            this.lastTime = time;

            // Make sure the time delta is not too big (can happen if user switches browser tab)
            deltaTime = Math.min(1 / 10, deltaTime);

            this.baseAirHockeyGame.onUpdate(deltaTime);
        }
    }
}
