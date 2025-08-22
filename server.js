const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('login', (data) => {
        console.log('Login:', data);
        socket.emit('chatStart', 'SimulatedPartner'); // demo
    });

    socket.on('message', (msg) => {
        socket.emit('message', Partner: Echo -> ${msg});
    });

    socket.on('skip', () => {
        socket.emit('partnerLeft');
        setTimeout(() => socket.emit('chatStart', 'NewPartner'), 500);
    });
});

server.listen(3000, () => console.log('Server running on port 3000'));
