import * as ee from 'event-emitter';

export let eventEmitter = ee({});

export function resetEmitter() {
    eventEmitter = ee({});
}

export const enum Events {
    AsteroidDestroyed = 'AsteroidDestroyed',
    PowerUpActivated = 'PowerUpActivated',
    AsteroidPlayerHit = 'AsteroidPlayerHit'
}