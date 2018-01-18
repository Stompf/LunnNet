import * as express from 'express';
import * as socketIO from 'socket.io';
import * as http from 'http';
import * as winston from 'winston';
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
    winston.info('a user connected: ' + socket.id);
    currentConnections.setValue(socket.id, socket);

    socket.on('QueueMatchMaking', (request: LunnNet.Network.QueueMatchMaking) => {
        winston.info('user: ' + socket.id + ' - queued: ' + request.game);
        matchMaking.addToQueue(socket, request.game);
    });

    socket.on('RemoveFromMatchMaking', (_request: LunnNet.Network.RemoveFromMatchMaking) => {
        matchMaking.removeFromQueue(socket);
    });

    socket.on('disconnect', () => {
        winston.info('a user disconnected: ' + socket.id);
        matchMaking.removeFromQueue(socket);
        currentConnections.remove(socket.id);
    });
});

httpServer.listen(port, () => {
    winston.info('listening on *:' + port);
});
