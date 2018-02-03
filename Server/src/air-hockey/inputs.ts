export interface Mapping {
    up: number;
    down: number;
    left: number;
    right: number;
    fire: number;
}


export class Inputs {
    constructor(public currentInput: Mapping) {
        this.resetInput();
    }

    resetInput() {
        this.currentInput = {
            down: 0,
            fire: 0,
            left: 0,
            right: 0,
            up: 0
        };
    }

    isDown(mapping: keyof Mapping) {
        return this.currentInput[mapping] === 1;
    }

    setMapping(mapping: Mapping) {
        this.currentInput = mapping;
    }

    setMappingKey(key: keyof Mapping, value: number) {
        this.currentInput[key] = value;
    }
}
