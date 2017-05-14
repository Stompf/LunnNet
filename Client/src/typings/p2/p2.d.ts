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
}