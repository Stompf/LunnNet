export namespace KeyboardStates {
    const currentPressedKeys: number[] = [];

    export function isKeyPressed(which: number) {
        return currentPressedKeys.indexOf(which) >= 0;
    }

    export function keyPressed(which: number) {
        if (!isKeyPressed(which)) {
            currentPressedKeys.push(which);
        }
    }

    export function keyReleased(which: number) {
        const index = currentPressedKeys.indexOf(which);
        if (index >= 0) {
            currentPressedKeys.splice(index, 1);
        }
    }
}
