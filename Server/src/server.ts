import * as express from 'express';
import * as socketIO from 'socket.io';
import * as http from 'http';
import * as https from 'https';
import * as winston from 'winston';
import * as fs from 'fs';
import { Dictionary } from 'typescript-collections';
import { MatchMaking } from './matchmaking';

const port = process.env.PORT || 4444;
const app = express();

let server: http.Server | https.Server;

if (process.env.NODE_ENV === 'production') {
    winston.info('Starting HTTPS server...');
    let privateKey = fs.readFileSync('/etc/letsencrypt/live/home.lunne.nu/privkey.pem', 'utf8');
    let certificate = fs.readFileSync('/etc/letsencrypt/live/home.lunne.nu/fullchain.pem', 'utf8');
    let credentials = { key: privateKey, cert: certificate };
    server = https.createServer(credentials, app);
} else {
    winston.info('Starting HTTP server...');
    server = http.createServer(app);
}

const currentConnections = new Dictionary<string, SocketIO.Socket>();
const matchMaking = new MatchMaking();

const io = socketIO();
io.serveClient(false);
io.attach(server);

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

server.listen(port, () => {
    winston.info('listening on *:' + port);
});
