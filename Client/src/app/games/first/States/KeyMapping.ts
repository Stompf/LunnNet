import { CharMap } from 'lunnNet/utils/CharMap';

export namespace KeyMapping {
    export const Mapping = {
        walk_forward: CharMap.getKeyNumber('W'),
        walk_back: CharMap.getKeyNumber('S'),
        walk_left: CharMap.getKeyNumber('A'),
        walk_right: CharMap.getKeyNumber('D')
    };
}
