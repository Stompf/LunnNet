declare namespace LunnNet {
    namespace PhysicsNetwork {
        interface PhysicOptions {
            gravity: number[];
            restitution: number;
        }

        interface NetworkPlayer {
            id: string;
            position: WebKitPoint;
        }

        interface NewNetworkPlayer extends NetworkPlayer {
            diameter: number;
            color: number;
            body: p2.Body;
        }

        interface GameFound {
            gameSize: Utils.Size;
            physicsOptions: PhysicOptions;
            players: NewNetworkPlayer[];
        }

        interface ServerTick { }
    }
}