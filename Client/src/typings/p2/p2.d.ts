import * as p2 from 'p2';

declare module 'p2' {
    export class TopDownVehicle {
        constructor(chassisBody: p2.Body);
        chassisBody: p2.Body;
        wheels: WheelConstraint[];

        addToWorld(world: p2.World): void;
        removeFromWorld(world: p2.World): void;
        addWheel(wheelOptions: WheelOptions): WheelConstraint;
    }

    export interface WheelOptions {
        localForwardVector?: number[];
        localPosition?: number[];
        steerValue?: number;
    }

    export class WheelConstraint {
        constructor(vehicle: TopDownVehicle, options?: WheelOptions);
        engineForce: number;
        steerValue: number;

        getSpeed(): number;
        setBrakeForce(brakeForce: number): void;
        setSideFriction(sideFriction: number): void;
        update(): void;
    }

    export interface Body {
        concavePath: Array<number[]>
    }

    export interface PostStepEvent {
        type: string;
    }

    export interface AddBodyEvent {
        type: string;
    }

    export interface RemoveBodyEvent {
        type: string;
    }

    export interface AddSpringEvent {
        type: string;
    }

    export interface ImpactEvent {
        type: string;
        bodyA: Body;
        bodyB: Body;
        shapeA: Shape;
        shapeB: Shape;
        contactEquation: ContactEquation;
    }

    export interface PostBroadphaseEvent {
        type: string;
        pairs: Body[];
    }

    export interface BeginContactEvent {
        type: string;
        shapeA: Shape;
        shapeB: Shape;
        bodyA: Body;
        bodyB: Body;
        contactEquations: ContactEquation[];
    }

    export interface EndContactEvent {
        type: string;
        shapeA: Shape;
        shapeB: Shape;
        bodyA: Body;
        bodyB: Body;
    }

    export interface PreSolveEvent {
        type: string;
        contactEquations: ContactEquation[];
        frictionEquations: FrictionEquation[];
    }
}