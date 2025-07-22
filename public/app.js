const socket = io();

const playerXLabel = document.getElementById("playerX");
const playerOLabel = document.getElementById("playerO");
const resetBtn = document.getElementById("reset-btn");
const canvas = document.getElementById("gameBoard");
const ctx = canvas.getContext("2d");

let mySymbol = null;
let isMyTurn = false;
let board = ["", "", "", "", "", "", "", "", ""];

function drawGrid() {
  ctx.clearRect(0, 0, 300, 300);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(100, 0);
  ctx.lineTo(100, 300);
  ctx.moveTo(200, 0);
  ctx.lineTo(200, 300);
  ctx.moveTo(0, 100);
  ctx.lineTo(300, 100);
  ctx.moveTo(0, 200);
  ctx.lineTo(300, 200);
  ctx.stroke();
}
drawGrid();

function drawX(row, col) {
  const x = col * 100;
  const y = row * 100;
  const pad = 20;
  ctx.strokeStyle = "red";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + pad, y + pad);
  ctx.lineTo(x + 100 - pad, y + 100 - pad);
  ctx.moveTo(x + 100 - pad, y + pad);
  ctx.lineTo(x + pad, y + 100 - pad);
  ctx.stroke();
}

function drawO(row, col) {
  const x = col * 100;
  const y = row * 100;
  const centerX = x + 50;
  const centerY = y + 50;
  const radius = 30;
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.stroke();
}

canvas.addEventListener("click", handleClick);
function handleClick(event) {
  if (!isMyTurn) return;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const col = Math.floor(x / 100);
  const row = Math.floor(y / 100);
  const index = row * 3 + col;

  if (board[index] !== "") return;
  socket.emit("playerMove", {index});
}

socket.on("assignSymbol", (symbol) => {
  mySymbol = symbol;
  console.log("You are:", mySymbol);
});

socket.on("startGame", ({yourTurn}) => {
  isMyTurn = yourTurn;
  console.log("Game started. Your turn?", isMyTurn);
});

socket.on("moveMade", ({index, symbol}) => {
  board[index] = symbol;
  const row = Math.floor(index / 3);
  const col = index % 3;
  symbol === "X" ? drawX(row, col) : drawO(row, col);
  isMyTurn = symbol !== mySymbol;
});

socket.on("gameOver", ({winner}) => {
  isMyTurn = false;
  if (winner === null) {
    alert("It's a draw!");
  } else {
    alert(`${winner} wins!`);
  }
});

socket.on("waiting", (id, msg) => {
  playerXLabel.textContent = id;
  playerOLabel.textContent = msg;
  console.log(msg);
});

socket.on("playerJoined", (xId, oId) => {
  playerXLabel.textContent = xId;
  playerOLabel.textContent = oId;
});

resetBtn.addEventListener("click", () => {
  socket.emit("resetGame");
});

socket.on("resetBoard", () => {
  board = Array(9).fill("");
  drawGrid();
});
