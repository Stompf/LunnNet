declare namespace LunnNet {
    namespace AchtungKurve {
        interface PhysicOptions {
            gravity: number[];
            restitution: number;
        }

        interface NewNetworkPlayer {
            id: string;
            position: WebKitPoint;
            color: number;
            diameter: number;
            mass: number;
            speed: number;
            movement: number;
        }

        interface GameFound {
            gameSize: Utils.Size;
            physicsOptions: PhysicOptions;
            players: NewNetworkPlayer[];
        }
    }
}
