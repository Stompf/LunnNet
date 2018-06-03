declare namespace LunnNet {
    type Game = 'AirHockey' | 'AchtungKurve';

    interface NetworkGame {
        readonly GAME_NAME: string;
        initGame(): void;
    }

    namespace Network {
        interface QueueMatchMaking {
            game: Game;
        }

        interface RemoveFromMatchMaking {}
    }

    namespace Utils {
        interface Rectangle {
            width: number;
            height: number;
            position: number[];
        }

        interface Size {
            width: number;
            height: number;
        }

        interface Point {
            x: number;
            y: number;
        }

        interface Line {
            x1: number;
            y1: number;
            x2: number;
            y2: number;
        }
    }
}
