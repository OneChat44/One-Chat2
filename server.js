const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files from 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Store users waiting for chat
let waitingUser = null;

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Store user's nickname
    let nickname = '';

    socket.on('login', (name) => {
        nickname = name || 'Guest';
        console.log(${nickname} logged in);

        if (waitingUser) {
            // Pair with waiting user
            const partner = waitingUser;
            waitingUser = null;

            socket.partnerId = partner.id;
            partner.partnerId = socket.id;

            // Notify both users
            socket.emit('chatStart', partner.nickname);
            partner.emit('chatStart', nickname);
        } else {
            waitingUser = socket;
            socket.emit('waiting');
        }
    });

    // Handle messages
    socket.on('message', (msg) => {
        if (socket.partnerId) {
            io.to(socket.partnerId).emit('message', msg);
        }
    });

    // Handle skip
    socket.on('skip', () => {
        const oldPartnerId = socket.partnerId;

        // Disconnect current chat
        if (oldPartnerId) {
            io.to(oldPartnerId).emit('partnerLeft');
            io.sockets.sockets.get(oldPartnerId).partnerId = null;
        }

        socket.partnerId = null;

        // Pair again
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
        console.log(${nickname} disconnected);

        // If user was waiting, remove
        if (waitingUser && waitingUser.id === socket.id) {
            waitingUser = null;
        }

        // Notify partner
        if (socket.partnerId) {
            io.to(socket.partnerId).emit('partnerLeft');
            io.sockets.sockets.get(socket.partnerId).partnerId = null;
        }
    });
});

// Start server
server.listen(PORT, () => console.log(Server running on port ${PORT}));