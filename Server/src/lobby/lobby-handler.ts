import { LunnNet } from '../typings';
import { Socket } from 'socket.io';
import { v4 } from 'uuid';
import { Dictionary } from 'typescript-collections';
import { Lobby } from './lobby';

export class LobbyHandler {
    activeLobbies: Dictionary<string, Lobby>;

    constructor() {
        this.activeLobbies = new Dictionary();
    }

    addLobby(name: string, game: LunnNet.Game, host: Socket) {
        const id = this.generateId();

        this.activeLobbies.setValue(
            id,
            new Lobby({
                id,
                game,
                host,
                name,
                status: 'waiting',
                players: [host],
                maxPlayers: 8
            })
        );
    }

    removeLobby(id: string) {
        const lobby = this.activeLobbies.getValue(id);
        if (lobby) {
            lobby.destroy();
            this.activeLobbies.remove(id);
        }
    }

    private generateId() {
        while (true) {
            const id = v4();
            if (!this.activeLobbies.containsKey(id)) {
                return id;
            }
        }
    }
}
