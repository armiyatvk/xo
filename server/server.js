const express = require("express");
const http = require("http");
const path = require("path");
const {Server} = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "../public")));

let waitingPlayer = null;
let gameCounter = 1;
const games = new Map();

function checkWinner(board) {
  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of wins) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (board.every((cell) => cell !== "")) return "draw";
  return null;
}

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  if (waitingPlayer === null) {
    waitingPlayer = socket;
    socket.emit("waiting", socket.id, "Waiting for another player...");
  } else {
    const gameId = `game-${gameCounter++}`;
    const playerX = waitingPlayer;
    const playerO = socket;

    games.set(gameId, {
      players: {X: playerX, O: playerO},
      board: Array(9).fill(""),
      turn: "X",
    });

    playerX.data.gameId = gameId;
    playerX.data.symbol = "X";
    playerO.data.gameId = gameId;
    playerO.data.symbol = "O";

    playerX.emit("assignSymbol", "X");
    playerO.emit("assignSymbol", "O");

    playerX.emit("startGame", {yourTurn: true});
    playerO.emit("startGame", {yourTurn: false});

    io.emit("playerJoined", playerX.id, playerO.id);

    waitingPlayer = null;
  }

  socket.on("playerMove", ({index}) => {
    const {symbol, gameId} = socket.data;
    const game = games.get(gameId);
    if (!game) return;

    const {board, players, turn} = game;
    if (symbol !== turn || board[index] !== "") return;

    board[index] = symbol;
    game.turn = symbol === "X" ? "O" : "X";

    players.X.emit("moveMade", {index, symbol});
    players.O.emit("moveMade", {index, symbol});

    const result = checkWinner(board);
    if (result === "X" || result === "O") {
      players.X.emit("gameOver", {winner: result});
      players.O.emit("gameOver", {winner: result});
    } else if (result === "draw") {
      players.X.emit("gameOver", {winner: null});
      players.O.emit("gameOver", {winner: null});
    }
  });

  socket.on("resetGame", () => {
    io.emit("resetBoard");
  });
});

server.listen(3000, () => {
  console.log("SERVER IS RUNNING ON 3000");
});
