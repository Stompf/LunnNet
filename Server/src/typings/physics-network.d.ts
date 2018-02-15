declare namespace LunnNet {
    namespace PhysicsNetwork {
        type Team = 'left' | 'right';

        interface PhysicOptions {
            gravity: number[];
            restitution: number;
        }

        interface UpdateNetworkPlayer {
            id: string;
            position: WebKitPoint;
        }

        interface UpdateFromClient {
            velocityHorizontal: number;
            velocityVertical: number;
        }

        interface NewGoal {
            teamThatScored: Team;
            teamLeftScore: number;
            teamRightScore: number;
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
            goals: GoalOptions[];
        }

        interface ServerTick {
            tick: number;
            players: UpdateNetworkPlayer[];
            ballUpdate: BallUpdate;
        }

        interface BallUpdate {
            velocity: number[];
            angularVelocity: number;
            position: WebKitPoint;
        }

        interface GoalOptions {
            top: PositionWithBox;
            bottom: PositionWithBox;
            back: PositionWithBox;
            goal: PositionWithBox;
        }

        interface PositionWithBox {
            x: number;
            y: number;
            height: number;
            width: number;
        }
    }
}