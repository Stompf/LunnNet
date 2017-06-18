// var app: Express.Application = require('express')();
// var http = require('http').Server(app);
// var io: SocketIO.Server = require('socket.io')(http);

import * as express from 'express';
import * as socketIO from 'socket.io';
import * as http from 'http';

// const port = process.env.PORT || 3333;
const app = express();
const httpServer = http.createServer(app);

const io = socketIO();
io.serveClient(true);
io.attach(httpServer);

io.on('connection', (_socket) => {
    console.log('a user connected');
});

httpServer.listen(3000, () => {
    console.log('listening on *:3000');
});
