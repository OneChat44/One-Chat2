const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let waiting = null;

app.use(express.static(__dirname));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("start", () => {
    if (waiting) {
      // Pair with waiting user
      socket.partner = waiting;
      waiting.partner = socket;

      waiting.emit("system", "You are now connected!");
      socket.emit("system", "You are now connected!");
      waiting = null;
    } else {
      waiting = socket;
      socket.emit("system", "Waiting for a stranger...");
    }
  });

  socket.on("message", (msg) => {
    if (socket.partner) {
      socket.partner.emit("message", msg);
    }
  });

  socket.on("skip", () => {
    if (socket.partner) {
      socket.partner.emit("system", "Your partner skipped.");
      socket.partner.partner = null;
      socket.partner = null;
    }
    socket.emit("system", "You skipped. Click Start to find new stranger.");
  });

  socket.on("disconnect", () => {
    if (waiting === socket) waiting = null;
    if (socket.partner) {
      socket.partner.emit("system", "Your partner disconnected.");
      socket.partner.partner = null;
    }
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});