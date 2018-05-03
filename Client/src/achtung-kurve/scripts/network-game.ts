import { Player, DEFAULT_PLAYER_OPTIONS } from './player';
import { KeyMapping } from './key-mapping';
import { PLAYER_COLORS } from './config';
import { BaseAchtungGame } from './base-game';

export class NetworkAchtungGame extends BaseAchtungGame {
    constructor(canvasId: string) {
        super(canvasId);
    }
}
