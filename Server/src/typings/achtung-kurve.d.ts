declare namespace LunnNet {
    namespace AchtungKurve {
        interface PhysicOptions {
            gravity: number[];
            restitution: number;
        }

        interface NewNetworkPlayer {
            id: string;
            color: number;
        }

        interface GameFound {
            gameSize: Utils.Size;
            physicsOptions: PhysicOptions;
            players: NewNetworkPlayer[];
        }

        interface ServerTick {
            tick: number;
            players: UpdatePlayer[];
        }

        interface UpdatePlayer {
            id: string;
            positions: WebKitPoint[];
        }
    }
}
