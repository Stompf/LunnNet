import { CharMap } from 'lunnEngine/utils/CharMap';

export namespace KeyMapping {
    export const Mapping = {
        walk_up: CharMap.getKeyNumber('W'),
        walk_back: CharMap.getKeyNumber('S'),
        walk_left: CharMap.getKeyNumber('A'),
        walk_right: CharMap.getKeyNumber('D')
    };
}
