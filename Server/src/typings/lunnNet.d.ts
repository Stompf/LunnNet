import { Socket } from 'socket.io';

export namespace LunnNet {
    type Game = 'AirHockey' | 'AchtungKurve';

    interface NetworkGame {
        readonly GAME_NAME: string;
        initGame(): void;
    }

    interface Lobby {
        id: string;
        name: string;
        players: Socket[];
        maxPlayers: number;
        host: Socket;
        status: 'waiting' | 'inGame';
        game: Game;
    }

    namespace Network {
        interface QueueMatchMaking {
            game: Game;
        }

        interface RemoveFromMatchMaking {}
    }

    namespace Utils {
        interface Rectangle {
            width: number;
            height: number;
            position: number[];
        }

        interface Size {
            width: number;
            height: number;
        }

        interface Point {
            x: number;
            y: number;
        }

        interface Line {
            x1: number;
            y1: number;
            x2: number;
            y2: number;
        }
    }
}
