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
    }
}