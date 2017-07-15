import * as express from 'express';
import * as socketIO from 'socket.io';
import * as http from 'http';
import { Dictionary } from 'typescript-collections';
import { MatchMaking } from './matchmaking';

const port = process.env.PORT || 4444;
const app = express();
const httpServer = http.createServer(app);
const currentConnections = new Dictionary<string, SocketIO.Socket>();
const matchMaking = new MatchMaking();

const io = socketIO();
io.serveClient(false);
io.attach(httpServer);

io.on('connection', socket => {
    console.log('a user connected: ' + socket.id);
    currentConnections.setValue(socket.id, socket);

    socket.on('QueueMatchMaking', (request: LunnNet.Network.QueueMatchMaking) => {
        console.log('user: ' + socket.id + ' - queued: ' + request.game);
        matchMaking.addToQueue(socket, request.game);
    });

    socket.on('RemoveFromMatchMaking', (_request: LunnNet.Network.RemoveFromMatchMaking) => {
        matchMaking.removeFromQueue(socket);
    });

    socket.on('disconnect', () => {
        console.log('a user disconnected: ' + socket.id);
        matchMaking.removeFromQueue(socket);
        currentConnections.remove(socket.id);
    });
});

httpServer.listen(port, () => {
    console.log('listening on *:' + port);
});
