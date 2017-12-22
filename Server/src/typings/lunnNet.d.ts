declare namespace LunnNet {
    const enum Game {
        AirHockey
    }

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
    }
}