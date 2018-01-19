declare namespace LunnNet {
    type Game = 'AirHockey' | 'PhysicsNetwork';

    namespace Network {
        interface QueueMatchMaking {
            game: Game;
        }

        interface RemoveFromMatchMaking { }
    }

    namespace AirHockey {
        interface GameFound { }

        interface ClientReady { }

        interface ServerTick {
            tick: number;
            playerPos: number[];
            ballPos: number[];
        }
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