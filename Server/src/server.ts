import * as express from 'express';
import * as socketIO from 'socket.io';
import * as http from 'http';
import { Dictionary } from 'typescript-collections';

const port = process.env.PORT || 3333;
const app = express();
const httpServer = http.createServer(app);
const currentConnections = new Dictionary<string, SocketIO.Socket>();

const io = socketIO();
io.serveClient(false);
io.attach(httpServer);

io.on('connection', socket => {
    console.log('a user connected: ' + socket.id);
    currentConnections.setValue(socket.id, socket);

    socket.on('disconnect', () => {
        console.log('a user disconnected: ' + socket.id);
        currentConnections.remove(socket.id);
    });
});

httpServer.listen(port, () => {
    console.log('listening on *:' + port);
});
