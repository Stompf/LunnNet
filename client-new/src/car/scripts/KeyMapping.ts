import { CharMap } from '../../lunnEngine/utils/CharMap';

export namespace KeyMapping {
    export const Mapping = {
        walk_up: CharMap.getKeyNumber('UP'),
        walk_back: CharMap.getKeyNumber('DOWN'),
        walk_left: CharMap.getKeyNumber('LEFT'),
        walk_right: CharMap.getKeyNumber('RIGHT')
    };
}
