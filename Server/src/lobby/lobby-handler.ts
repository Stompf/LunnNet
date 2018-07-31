import { LunnNet } from '../typings';
import { Socket } from 'socket.io';
import { v4 } from 'uuid';

export class LobbyHandler {
    activeLobbies: LunnNet.Lobby[];

    constructor() {
        this.activeLobbies = [];
    }

    addLobby(name: string, game: LunnNet.Game, host: Socket) {
        this.activeLobbies.push({
            id: v4(),
            game,
            host,
            name,
            status: 'waiting',
            players: [host],
            maxPlayers: 8
        });
    }
}
