// Lógica del juego Par e Impar

export const oddNumbers = [1, 3, 5, 7, 9];
export const evenNumbers = [2, 4, 6, 8];

export function createGame(player1, player2) {
  return {
    board: Array(9).fill(null),
    available: {
      [player1]: [...oddNumbers],
      [player2]: [...evenNumbers]
    },
    turn: player1, // impar siempre empieza
    players: [player1, player2],
    winner: null,
    draw: false,
    moves: []
  };
}

export function createSeries(player1, player2, totalRounds) {
  return {
    players: [player1, player2],
    totalRounds: totalRounds,
    currentRound: 1,
    scores: {
      [player1]: 0,
      [player2]: 0
    },
    roundsToWin: Math.ceil(totalRounds / 2),
    history: [],
    winner: null,
    isComplete: false
  };
}

export function updateSeriesScore(series, roundWinner) {
  if (roundWinner) {
    series.scores[roundWinner]++;
  }
  
  // Verificar si alguien ganó la serie
  if (series.scores[series.players[0]] >= series.roundsToWin) {
    series.winner = series.players[0];
    series.isComplete = true;
  } else if (series.scores[series.players[1]] >= series.roundsToWin) {
    series.winner = series.players[1];
    series.isComplete = true;
  } else if (series.currentRound >= series.totalRounds) {
    // Si se acabaron las rondas y no hay ganador, es empate
    series.isComplete = true;
  }
}

export function nextRound(series) {
  if (!series.isComplete) {
    series.currentRound++;
  }
}

export function makeMove(game, idx, number) {
  if (game.board[idx] !== null) return false;
  if (!game.available[game.turn].includes(number)) return false;
  game.board[idx] = number;
  game.available[game.turn] = game.available[game.turn].filter(n => n !== number);
  game.moves.push({ player: game.turn, idx, number });
  // Verificar victoria
  if (checkWin(game.board)) {
    game.winner = game.turn;
  } else if (game.board.every(cell => cell !== null)) {
    game.draw = true;
  } else {
    // Cambiar turno
    game.turn = game.players.find(p => p !== game.turn);
  }
  return true;
}

export function checkWin(board) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // filas
    [0,3,6],[1,4,7],[2,5,8], // columnas
    [0,4,8],[2,4,6]          // diagonales
  ];
  for (const line of lines) {
    const [a,b,c] = line;
    if (board[a] && board[b] && board[c] && (board[a]+board[b]+board[c] === 15)) {
      return true;
    }
  }
  return false;
}
