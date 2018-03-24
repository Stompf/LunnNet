import * as express from 'express';
import * as socketIO from 'socket.io';
import * as http from 'http';
import { logger } from './logger';
import * as compression from 'compression';
import * as helmet from 'helmet';
import { MatchMaking } from './matchmaking';

const port = process.env.PORT || 4444;
const app = express();

app.use(compression()); // Compress all routes
app.use(helmet());

logger.info('Starting HTTP server...');
const server = http.createServer(app);

const matchMaking = new MatchMaking();

const io = socketIO();
io.serveClient(false);
io.attach(server);

io.on('connection', socket => {
    logger.info('a user connected: ' + socket.id);

    socket.on('QueueMatchMaking', (request: LunnNet.Network.QueueMatchMaking) => {
        logger.info('user: ' + socket.id + ' - queued: ' + request.game);
        matchMaking.addToQueue(socket, request.game);
    });

    socket.on('RemoveFromMatchMaking', (_request: LunnNet.Network.RemoveFromMatchMaking) => {
        matchMaking.removeFromQueue(socket);
    });

    socket.on('disconnect', () => {
        logger.info('a user disconnected: ' + socket.id);
        matchMaking.removeFromQueue(socket);
    });
});

server.listen(port, () => {
    logger.info('listening on *:' + port);
});
