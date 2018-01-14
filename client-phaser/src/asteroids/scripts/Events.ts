import * as ee from 'event-emitter';

export const eventEmitter = ee({});

export const enum Events {
    AsteroidDestroyed = 'AsteroidDestroyed',
    PowerUpActivated = 'PowerUpActivated',
    AsteroidPlayerHit = 'AsteroidPlayerHit'
}