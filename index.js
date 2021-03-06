const express = require('express');
const socketIO = require('socket.io');

const port = process.env.PORT || 8080;

const server = express()
    .get('/', (req, res) => res.json({time: Date.now(), port}).status(200))
    .listen(port, () => console.log(`Server is listening on port ${port}`));

//

const io = socketIO(server);

let rooms = {};

io.on('connection', socket => {
    console.log(`[+] ${socket.id}`);

    let roomID = '';

    socket.on('join', ({room}) => {
        roomID = room;

        if (rooms[room] === undefined)
            rooms[room] = {url: '', playing: true, seconds: 0, lastUpdated: Date.now()};

        socket.join(room);

        socket.emit('welcome', rooms[room]);
    });

    socket.on('start', data => {
        if (data.url === rooms[roomID].url) return;

        socket.to(roomID).broadcast.emit('start', data);
        rooms[roomID].url = data.url;
        rooms[roomID].playing = true;
        rooms[roomID].seconds = 0;
        rooms[roomID].lastUpdated = Date.now();
    });

    socket.on('play', data => {
        // if(rooms[roomID].playing && Math.abs(data.seconds - Math.floor((Date.now() - rooms[roomID].lastUpdated) / 1000)) < 0.5) return;

        socket.to(roomID).broadcast.emit('play', data);
        rooms[roomID].playing = true;
        rooms[roomID].seconds = data.seconds;
        rooms[roomID].lastUpdated = Date.now();
    });

    socket.on('pause', data => {
        socket.to(roomID).broadcast.emit('pause', data);
        rooms[roomID].playing = false;
        rooms[roomID].seconds = data.seconds;
        rooms[roomID].lastUpdated = Date.now();
    });

    socket.on('disconnect', () => {
        console.log(`[-] ${socket.id}`);
    });
});
