const http = require('http');
const socketIo = require('socket.io');
const app = require('express')();

const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', socket => {
    console.log(`[+] ${socket.id}`);

    socket.on('start', data => {
        socket.broadcast.emit('start', data);
    });

    socket.on('play', data => {
        socket.broadcast.emit('play', data);
    });

    socket.on('pause', data => {
        socket.broadcast.emit('pause', data);
    });

    socket.on('disconnect', () => {
        console.log(`[-] ${socket.id}`);
    });
});

const port = 4455;
server.listen(4455, () => console.log(`Server is listening on port ${port}`));
