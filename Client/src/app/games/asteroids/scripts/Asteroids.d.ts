declare namespace Asteroids {
    interface Bullet {
        body: p2.Body;
        dieTime: number;
    }

    interface Asteroid {
        body: p2.Body;
        level: number;
        verts: number[][];
    }
}