declare namespace LunnNet {
    type Game = 'AirHockey' | 'PhysicsNetwork';

    namespace Network {
        interface QueueMatchMaking {
            game: Game;
        }

        interface RemoveFromMatchMaking { }
    }

    namespace PhysicsNetwork {
        interface GameFound { }

        interface ServerTick { }
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
    }
}