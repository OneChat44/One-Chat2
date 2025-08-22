const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

let waitingUser = null;

io.on('connection', (socket) => {
    let nickname = '';

    socket.on('login', (name) => {
        nickname = name || 'Guest';
        if (waitingUser) {
            const partner = waitingUser;
            waitingUser = null;

            socket.partnerId = partner.id;
            partner.partnerId = socket.id;

            socket.emit('chatStart', partner.nickname);
            partner.emit('chatStart', nickname);
        } else {
            waitingUser = socket;
            socket.emit('waiting');
        }
    });

    socket.on('message', (msg) => {
        if (socket.partnerId) io.to(socket.partnerId).emit('message', msg);
    });

    socket.on('skip', () => {
        const oldPartnerId = socket.partnerId;
        if (oldPartnerId) {
            io.to(oldPartnerId).emit('partnerLeft');
            io.sockets.sockets.get(oldPartnerId).partnerId = null;
        }
        socket.partnerId = null;
        if (waitingUser && waitingUser.id !== socket.id) {
            const partner = waitingUser;
            waitingUser = null;

            socket.partnerId = partner.id;
            partner.partnerId = socket.id;

            socket.emit('chatStart', partner.nickname);
            partner.emit('chatStart', nickname);
        } else {
            waitingUser = socket;
            socket.emit('waiting');
        }
    });

    socket.on('disconnect', () => {
        if (waitingUser && waitingUser.id === socket.id) waitingUser = null;
        if (socket.partnerId) {
            io.to(socket.partnerId).emit('partnerLeft');
            io.sockets.sockets.get(socket.partnerId).partnerId = null;
        }
    });
});

server.listen(PORT, () => console.log(Server running on port ${PORT}));