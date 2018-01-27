declare namespace LunnNet {
    namespace PhysicsNetwork {
        interface PhysicOptions {
            gravity: number[];
            restitution: number;
        }

        interface UpdateNetworkPlayer {
            id: string;
            position: WebKitPoint;
        }

        interface NewNetworkPlayer {
            id: string;
            position: WebKitPoint;
            diameter: number;
            color: number;
        }

        interface BallOptions {
            diameter: number;
            mass: number;
            color: number;
        }

        interface GameFound {
            gameSize: Utils.Size;
            physicsOptions: PhysicOptions;
            players: NewNetworkPlayer[];
            ball: BallOptions;
        }

        interface ServerTick {
            tick: number;
            players: UpdateNetworkPlayer[];
        }

        interface BallUpdate {

        }
    }
}