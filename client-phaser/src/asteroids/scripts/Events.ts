import * as ee from 'event-emitter';

export const eventEmitter = ee({});

export const enum Events {
    AsteroidDestroyed = 'asteroidDestroyed',
    PowerUpActivated = 'powerUpActivated'
}