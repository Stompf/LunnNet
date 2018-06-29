declare namespace LunnNet {
    namespace AchtungKurve {
        interface Options {
            player: {
                speed: number;
                diameter: number;
            };
        }

        interface UpdateFromClient {
            movement: number;
        }

        interface NewNetworkPlayer {
            id: string;
            color: number;
            startPosition: Utils.Point;
            startMovement: number;
        }

        interface GameFound {
            gameSize: Utils.Size;
            options: Options;
            players: NewNetworkPlayer[];
        }

        interface ServerTick {
            tick: number;
            players: UpdatePlayer[];
        }

        interface UpdatePlayer {
            id: string;
            position: Utils.Point;
        }

        interface NewRoundPlayer extends UpdatePlayer {
            movement: number;
        }

        interface PlayerReady {}

        interface RoundOver {
            winnerId?: string;
            color?: number;
            roundTimeout: number;
            players: NewRoundPlayer[];
        }

        interface StartPosition {
            movement: number;
            position: Utils.Point;
        }
    }
}
