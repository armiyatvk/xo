# ❌🟡 XO Multiplayer Canvas Game

This is a real-time, two-player Tic-Tac-Toe (XO) game built using **HTML Canvas**, **Node.js**, and **Socket.IO**.

---

## 🎮 Features

- 1v1 multiplayer over WebSockets
- Canvas-based XO board drawing
- Player matchmaking with auto-pairing
- Turn-based enforcement
- Win and draw detection
- Instant move sync between players

---

## 📁 Project Structure

xo-socket-game/
├── public/
│ ├── index.html
│ ├── app.js
│ └── style.css (optional)
├── server/
│ └── server.js
├── package.json
└── README.md

---

## 🚀 How to Run

```bash
npm install
npm start
```

## Tech Stack

Frontend: HTML5 Canvas + Vanilla JS

Backend: Express + Socket.IO

Transport: WebSocket via Socket.IO
