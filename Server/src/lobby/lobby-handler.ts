import { LunnNet } from '../typings';

export class LobbyHandler {
    activeLobbies: LunnNet.Lobby[];

    constructor() {
        this.activeLobbies = [];
    }
}
