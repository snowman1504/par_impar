// Backend básico para Par e Impar
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/src', express.static(path.join(__dirname, '../src')));

const DATA_PATH = path.join(__dirname, 'data.json');

// Cargar o inicializar datos
function loadData() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify({ players: [], games: [], stats: {} }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_PATH));
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// Registrar jugador
app.post('/api/register', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const data = loadData();
  if (data.players.find(p => p.name === name)) {
    return res.status(400).json({ error: 'Player already exists' });
  }
  data.players.push({ name });
  data.stats[name] = 0;
  saveData(data);
  res.json({ success: true });
});

// Obtener jugadores
app.get('/api/players', (req, res) => {
  const data = loadData();
  res.json(data.players);
});

// Guardar resultado de juego
app.post('/api/game', (req, res) => {
  const { winner, players } = req.body;
  if (!winner || !players) return res.status(400).json({ error: 'Missing data' });
  const data = loadData();
  data.games.push({ winner, players, date: new Date() });
  if (data.stats[winner] !== undefined) data.stats[winner]++;
  saveData(data);
  res.json({ success: true });
});

// Obtener estadísticas
app.get('/api/stats', (req, res) => {
  const data = loadData();
  res.json(data.stats);
});

// Ayuda (puede usarse para mostrar reglas)
app.get('/api/help', (req, res) => {
  res.json({
    es: 'Coloca tus números en el tablero para sumar 15 en línea. Impar empieza. Gana quien logre una línea de 15.',
    en: 'Place your numbers on the board to sum 15 in a line. Odd starts. Win by making a line of 15.'
  });
});

const server = http.createServer(app);
const io = new Server(server);

// Salas de juego online
const onlineGames = {};

io.on('connection', (socket) => {
  // Unirse a una sala
  socket.on('joinRoom', ({ room, player }) => {
    if (!onlineGames[room]) {
      onlineGames[room] = { players: [], board: Array(9).fill(null), available: {}, turn: null, moves: [] };
    }
    const game = onlineGames[room];
    if (game.players.length < 2 && !game.players.includes(player)) {
      game.players.push(player);
      game.available[player] = game.players.length === 1 ? [1,3,5,7,9] : [2,4,6,8];
      if (game.players.length === 2) game.turn = game.players[0];
    }
    socket.join(room);
    io.to(room).emit('update', { ...game });
  });

  // Movimiento
  socket.on('move', ({ room, idx, number, player }) => {
    const game = onlineGames[room];
    if (!game || game.turn !== player) return;
    if (game.board[idx] !== null) return;
    if (!game.available[player].includes(number)) return;
    game.board[idx] = number;
    game.available[player] = game.available[player].filter(n => n !== number);
    game.moves.push({ player, idx, number });
    // Verificar victoria
    let finished = false;
    if (checkWin(game.board)) {
      game.winner = player;
      finished = true;
    } else if (game.board.every(cell => cell !== null)) {
      game.draw = true;
      finished = true;
    } else {
      game.turn = game.players.find(p => p !== player);
    }
    io.to(room).emit('update', { ...game });
    // Guardar resultado si terminó
    if (finished) {
      try {
        const data = loadData();
        data.games.push({ winner: game.winner || null, players: game.players, date: new Date() });
        if (game.winner && data.stats[game.winner] !== undefined) data.stats[game.winner]++;
        saveData(data);
      } catch (e) {
        console.error('Error guardando partida online:', e);
      }
    }
  });

  // Salir de la sala
  socket.on('leaveRoom', ({ room, player }) => {
    socket.leave(room);
    if (onlineGames[room]) {
      onlineGames[room].players = onlineGames[room].players.filter(p => p !== player);
      if (onlineGames[room].players.length === 0) delete onlineGames[room];
    }
  });
});

// Reemplazar app.listen por server.listen
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Función para verificar victoria (igual que en game.js)
function checkWin(board) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const line of lines) {
    const [a,b,c] = line;
    if (board[a] && board[b] && board[c] && (board[a]+board[b]+board[c] === 15)) {
      return true;
    }
  }
  return false;
}
