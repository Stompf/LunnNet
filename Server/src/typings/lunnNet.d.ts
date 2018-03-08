declare namespace LunnNet {
    type Game = 'AirHockey';

    interface NetworkGame {
        readonly GAME_NAME: string;
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
    }
}
