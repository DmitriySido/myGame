const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");
const path = require("path");

const dev = false; // production
const app = next({ dev, dir: path.resolve(__dirname) });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res));

  const io = new Server(server, {
    path: "/game/socket.io" // путь для прокси через Nginx
  });

  const rooms = {};

  io.on("connection", (socket) => {
    console.log("CONNECTED:", socket.id);

    // Создание комнаты
    socket.on("createRoom", ({ name }) => {
      const roomId = Math.floor(100000 + Math.random() * 900000).toString();
      rooms[roomId] = {
        players: [socket.id],
        secrets: {},
        turn: null,
        playerNames: { [socket.id]: name }
      };
      socket.join(roomId);
      socket.emit("roomCreated", roomId);
      console.log("ROOM CREATED:", roomId);
    });

    // Вход в комнату
    socket.on("joinRoom", ({ roomId, name }) => {
      if (!rooms[roomId] || rooms[roomId].players.length >= 2) return;

      socket.join(roomId);
      rooms[roomId].players.push(socket.id);
      rooms[roomId].playerNames[socket.id] = name;

      if (rooms[roomId].players.length === 2) {
        const [id1, id2] = rooms[roomId].players;
        io.to(id1).emit("otherPlayer", { name: rooms[roomId].playerNames[id2] });
        io.to(id2).emit("otherPlayer", { name: rooms[roomId].playerNames[id1] });

        io.to(roomId).emit("bothConnected");
      }
      console.log("JOINED ROOM:", roomId, "Player:", name);
    });

    // Игрок загадывает число
    socket.on("setSecret", ({ roomId, number }) => {
      if (!rooms[roomId]) return;
      rooms[roomId].secrets[socket.id] = number;
      console.log("SECRET SET:", socket.id, number);
      if (Object.keys(rooms[roomId].secrets).length === 2) {
        rooms[roomId].turn = rooms[roomId].players[0];
        io.to(roomId).emit("startGame", rooms[roomId].turn);
      }
    });

    // Ход
    socket.on("makeGuess", ({ roomId, guess }) => {
      const room = rooms[roomId];
      if (!room) return;
      if (room.turn !== socket.id) return;

      const opponentId = room.players.find(id => id !== socket.id);
      const secret = room.secrets[opponentId];
      const result = checkGuess(secret, guess);

      io.to(roomId).emit("guessResult", {
        player: socket.id,
        guess,
        result
      });

      if (result.bulls === 4) {
        io.to(roomId).emit("gameOver", socket.id);
      } else {
        room.turn = opponentId;
        io.to(roomId).emit("changeTurn", room.turn);
      }
    });

    socket.on("disconnect", () => {
      console.log("DISCONNECTED:", socket.id);
    });
  });

  server.listen(3001, () => {
    console.log("GAME SERVER STARTED ON PORT 3001");
  });
});

function checkGuess(secret, guess) {
  let bulls = 0;
  let cows = 0;
  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) bulls++;
    else if (secret.includes(guess[i])) cows++;
  }
  return { bulls, cows };
}