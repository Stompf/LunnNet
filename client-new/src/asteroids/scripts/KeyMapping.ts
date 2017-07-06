import { CharMap } from '../../lunnEngine/utils/CharMap';

export namespace KeyMapping {
    export const Mapping = {
        up: CharMap.getKeyNumber('UP'),
        down: CharMap.getKeyNumber('DOWN'),
        left: CharMap.getKeyNumber('LEFT'),
        right: CharMap.getKeyNumber('RIGHT'),
        fire: CharMap.getKeyNumber('SPACE')
    };
}
