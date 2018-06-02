// Adapted from http://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect/1968345#1968345
let eps = 0.0000001;
function between(a: number, b: number, c: number) {
    return a - eps <= b && b <= c + eps;
}

export function segmentIntersection(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number
) {
    let x =
        ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
        ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    let y =
        ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
        ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    if (isNaN(x) || isNaN(y)) {
        return false;
    } else {
        if (x1 >= x2) {
            if (!between(x2, x, x1)) {
                return false;
            }
        } else {
            if (!between(x1, x, x2)) {
                return false;
            }
        }
        if (y1 >= y2) {
            if (!between(y2, y, y1)) {
                return false;
            }
        } else {
            if (!between(y1, y, y2)) {
                return false;
            }
        }
        if (x3 >= x4) {
            if (!between(x4, x, x3)) {
                return false;
            }
        } else {
            if (!between(x3, x, x4)) {
                return false;
            }
        }
        if (y3 >= y4) {
            if (!between(y4, y, y3)) {
                return false;
            }
        } else {
            if (!between(y3, y, y4)) {
                return false;
            }
        }
    }
    return { x: x, y: y };
}
