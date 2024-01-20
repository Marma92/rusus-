import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

import path from 'path';
import { pickWW } from './utils/werewolf.js';

app.use(express.static(path.join(__dirname, 'public')));

// Default route handler for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let players = new Map(); // Map to store player details by socket ID
let werewolf;

io.on('connection', socket => {
  socket.on('joinGame', playerName => {
    players.set(socket.id, { name: playerName, ready: false });
    io.emit(
      'newPlayer',
      playerName,
      players.size,
      Array.from(players.values()).filter(player => player.ready).length
    );
  });

  socket.on('newGame', () => {
    if (players.get(socket.id)) {
      const player = players.get(socket.id);
      players.set(socket.id, { name: player.name, ready: true });
      io.emit(
        'playerReady',
        player.name,
        players.size,
        Array.from(players.values()).filter(player => player.ready).length
      );
      if (
        players.size ===
        Array.from(players.values()).filter(player => player.ready).length
      ) {
        io.emit('gameOn');
        const wwId = pickWW(players);
        werewolf = players.get(wwId);
        io.to(wwId).emit('werewolfAlert', 'YOU ARE THE IMPOSTOR');
        console.log(werewolf.name + ' is the werewolf');
      }
    }
  });

  socket.on('gameOver', () => {
    players.set(socket.id, { name: players.get(socket.id).name, ready: false });
    io.emit(
      'playerGameOver',
      players.get(socket.id).name,
      players.size,
      Array.from(players.values()).filter(player => !player.ready).length
    );
    if (
      players.size ===
      Array.from(players.values()).filter(player => !player.ready).length
    ) {
      io.emit('allPlayersGameOver', werewolf);
    }
  });

  socket.on('disconnect', () => {
    const player = players.get(socket.id);
    if (player) {
      players.delete(socket.id);
      io.emit(
        'playerGone',
        player.name,
        players.size,
        Array.from(players.values()).filter(player => player.ready).length
      );
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
