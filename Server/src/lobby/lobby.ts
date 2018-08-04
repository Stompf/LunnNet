import { LunnNet } from '../typings';
import { Socket } from 'socket.io';
import { UnreachableCaseError } from '../common';

export class Lobby {
    private id: string;
    private maxPlayers: number;
    private name: string;
    private game: LunnNet.Game;
    private host: Socket;
    private players: Socket[];
    private status: 'waiting' | 'inGame';

    constructor(lobby: LunnNet.Lobby) {
        this.id = lobby.id;
        this.maxPlayers = lobby.maxPlayers;
        this.name = lobby.name;
        this.game = lobby.game;
        this.host = lobby.host;
        this.status = lobby.status;
        this.players = lobby.players;
    }

    destroy() {
        // TODO
    }

    swit() {
        switch (this.game) {
            default:
                throw new UnreachableCaseError(this.game);
        }
    }
}
