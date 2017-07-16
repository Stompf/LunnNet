import { CharMap } from '../../lunnEngine/utils/CharMap';

export namespace KeyMapping {

    export interface Mapping {
        up: number;
        down: number;
        left: number;
        right: number;
        fire: number;
    }

    export const Player1_Mapping = {
        up: CharMap.getKeyNumber('UP'),
        down: CharMap.getKeyNumber('DOWN'),
        left: CharMap.getKeyNumber('LEFT'),
        right: CharMap.getKeyNumber('RIGHT'),
        fire: CharMap.getKeyNumber('SPACE')
    };

    export const Player2_Mapping = {
        up: CharMap.getKeyNumber('W'),
        down: CharMap.getKeyNumber('S'),
        left: CharMap.getKeyNumber('A'),
        right: CharMap.getKeyNumber('D'),
        fire: CharMap.getKeyNumber('F')
    };
}
