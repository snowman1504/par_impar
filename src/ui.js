let langData = {};

export async function loadLang(lang) {
  langData = await fetch(`./src/lang/${lang}.json`).then(r => r.json());
}

export function t(key) {
  return langData[key] || key;
}

export function showRoundsSelector(gameMode, onBack) {
  const root = document.getElementById('app');
  root.innerHTML = `
    <div class="rounds-selector">
      <h2>${t('select_rounds')}</h2>
      <div class="rounds-options">
        <button class="round-btn" data-rounds="1">1 ${t('round')}</button>
        <button class="round-btn" data-rounds="3">3 ${t('rounds')}</button>
        <button class="round-btn" data-rounds="5">5 ${t('rounds')}</button>
        <button class="round-btn" data-rounds="7">7 ${t('rounds')}</button>
        <button class="round-btn" data-rounds="9">9 ${t('rounds')}</button>
      </div>
      <button id="back-btn">${t('back')}</button>
    </div>
  `;
  
  document.querySelectorAll('.round-btn').forEach(btn => {
    btn.onclick = () => {
      const rounds = parseInt(btn.dataset.rounds);
      if (gameMode === 'cpu') {
        if (typeof window.startCpuGame === 'function') {
          window.startCpuGame(rounds);
        }
      } else if (gameMode === 'player') {
        if (typeof window.startPlayerGame === 'function') {
          window.startPlayerGame(rounds);
        }
      }
    };
  });
  
  document.getElementById('back-btn').onclick = onBack || (() => window.location.reload());
}

export function showRegister(onRegister, onBack) {
  const root = document.getElementById('app');
  root.innerHTML = `
    <div class="register">
      <h2>${t('register')}</h2>
      <input id="player1" placeholder="${t('player_name')} 1" />
      <input id="player2" placeholder="${t('player_name')} 2" />
      <button id="register-btn">${t('confirm')}</button>
      ${onBack ? `<button id="back-btn">${t('back')}</button>` : ''}
    </div>
  `;
  document.getElementById('register-btn').onclick = async () => {
    const p1 = document.getElementById('player1').value.trim();
    const p2 = document.getElementById('player2').value.trim();
    if (!p1 || !p2 || p1 === p2) {
      alert(t('invalid_names') || 'Nombres inválidos');
      return;
    }
    try {
      const res1 = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: p1 }) });
      const data1 = await res1.json();
      if (!res1.ok && data1.error !== 'Player already exists') throw new Error(data1.error || 'Error');
      const res2 = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: p2 }) });
      const data2 = await res2.json();
      if (!res2.ok && data2.error !== 'Player already exists') throw new Error(data2.error || 'Error');
      onRegister(p1, p2);
    } catch (err) {
      alert(t(err.message) || err.message);
    }
  };
  if (onBack) {
    document.getElementById('back-btn').onclick = onBack;
  }
}

export function showMenu({ onPlay, onHelp, onStats, onExit }) {
  const root = document.getElementById('app');
  root.innerHTML = `
    <div class="menu">
      <h1>${t('title')}</h1>
      <button id="play-btn">${t('play')}</button>
      <button id="play-online-btn">${t('play_online')}</button>
      <button id="help-btn">${t('help')}</button>
      <button id="stats-btn">${t('stats')}</button>
      <button id="exit-btn">${t('exit')}</button>
    </div>
  `;
  document.getElementById('play-btn').onclick = onPlay;
  document.getElementById('play-online-btn').onclick = showOnlineMenu;
  document.getElementById('help-btn').onclick = onHelp;
  document.getElementById('stats-btn').onclick = onStats;
  document.getElementById('exit-btn').onclick = onExit;
}

function showOnlineMenu() {
  const root = document.getElementById('app');
  root.innerHTML = `
    <div class="register">
      <h2>${t('play_online')}</h2>
      <input id="player" placeholder="${t('player_name')}" />
      <input id="room" placeholder="Código de sala" />
      <button id="create-btn">Crear sala</button>
      <button id="join-btn">Unirse</button>
      <button id="back-btn">${t('back')}</button>
    </div>
  `;
  document.getElementById('create-btn').onclick = () => startOnline(true);
  document.getElementById('join-btn').onclick = () => startOnline(false);
  document.getElementById('back-btn').onclick = () => window.location.reload();
}

function startOnline(isCreator) {
  const player = document.getElementById('player').value.trim();
  let room = document.getElementById('room').value.trim();
  if (!player) return alert('Nombre requerido');
  if (!room) room = Math.random().toString(36).substring(2, 8);
  showOnlineGame(player, room, isCreator);
}

function showOnlineGame(player, room, isCreator) {
  const socket = window.io();
  let game = null;
  socket.emit('joinRoom', { room, player });
  render('Esperando rival...');

  socket.on('update', (g) => {
    game = g;
    render();
  });

  function render(msg) {
    const root = document.getElementById('app');
    if (!game || game.players.length < 2) {
      root.innerHTML = `<div class="game"><h2>Online: ${room}</h2><p>${msg || 'Esperando rival...'}</p><button id="back-btn">${t('back')}</button></div>`;
      document.getElementById('back-btn').onclick = () => { socket.emit('leaveRoom', { room, player }); window.location.reload(); };
      return;
    }
    root.innerHTML = `
      <div class="game">
        <h2>${t('your_turn')}: ${game.turn}</h2>
        <div class="board">
          ${game.board.map((cell, i) => `
            <div class="cell" data-idx="${i}">${cell !== null ? cell : ''}</div>
          `).join('')}
        </div>
        <div class="numbers">
          <div><b>${game.players[0]} (${t('odd')}):</b> ${game.available[game.players[0]].join(', ')}</div>
          <div><b>${game.players[1]} (${t('even')}):</b> ${game.available[game.players[1]].join(', ')}</div>
        </div>
        <div class="pick-number"></div>
        <button id="back-btn">${t('back')}</button>
      </div>
    `;
    document.getElementById('back-btn').onclick = () => { socket.emit('leaveRoom', { room, player }); window.location.reload(); };
    if (!game.winner && !game.draw && game.turn === player) {
      document.querySelectorAll('.cell').forEach(cell => {
        cell.onclick = () => {
          const idx = parseInt(cell.dataset.idx);
          if (game.board[idx] !== null) return;
          showNumberPicker(idx);
        };
      });
    } else if (game.winner || game.draw) {
      if (game.draw) {
        showCelebration('draw');
      } else {
        showCelebration('win', game.winner, player);
      }
    }
  }

  function showNumberPicker(idx) {
    const pickDiv = document.querySelector('.pick-number');
    const nums = game.available[player];
    pickDiv.innerHTML = `<div>${t('your_turn')}: ${player}<br>${t('select_players')}:<br>${nums.map(n => `<button class="num-btn" data-num="${n}">${n}</button>`).join('')}</div>`;
    document.querySelectorAll('.num-btn').forEach(btn => {
      btn.onclick = () => {
        const num = parseInt(btn.dataset.num);
        socket.emit('move', { room, idx, number: num, player });
      };
    });
  }
}

function showCelebration(type, winner, player) {
  const pickDiv = document.querySelector('.pick-number');
  let msg = '';
  let emoji = '';
  if (type === 'win') {
    msg = winner === player ? t('you_win') : t('you_lose');
    emoji = winner === player ? '🎉🏆' : '😢';
  } else if (type === 'draw') {
    msg = t('draw');
    emoji = '🤝';
  }
  pickDiv.innerHTML = `<div class="celebration"><span class="celebration-emoji">${emoji}</span><h3>${msg}</h3><button id="next-btn">${t('next')}</button></div>`;
  document.getElementById('next-btn').onclick = () => window.location.reload();
  // Animación CSS
  const style = document.createElement('style');
  style.innerHTML = `
    .celebration-emoji {
      font-size: 3rem;
      animation: pop 0.7s cubic-bezier(.36,1.56,.64,1) 2;
      display: block;
      margin-bottom: 0.5rem;
    }
    @keyframes pop {
      0% { transform: scale(0.5); opacity: 0.2; }
      60% { transform: scale(1.3); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

export function showHelp(lang, onBack) {
  const root = document.getElementById('app');
  fetch('/api/help').then(r => r.json()).then(help => {
    root.innerHTML = `
      <div class="help">
        <h2>${t('rules_title')}</h2>
        <p>${help[lang]}</p>
        <button id="back-btn">${t('back')}</button>
      </div>
    `;
    document.getElementById('back-btn').onclick = onBack;
  });
}

export function showStats(lang, onBack) {
  const root = document.getElementById('app');
  fetch('/api/stats').then(r => r.json()).then(stats => {
    root.innerHTML = `
      <div class="stats">
        <h2>${t('stats')}</h2>
        <ul>
          ${Object.entries(stats).map(([name, wins]) => `<li>${name}: ${wins} ${t('victories')}</li>`).join('')}
        </ul>
        <button id="back-btn">${t('back')}</button>
      </div>
    `;
    document.getElementById('back-btn').onclick = onBack;
  });
}

import { createGame, makeMove, oddNumbers, evenNumbers, createSeries, updateSeriesScore, nextRound } from './game.js';

export function showGame(player1, player2, lang, onBack, isCpu = false, totalRounds = 1) {
  let series = createSeries(player1, player2, totalRounds);
  let currentGame = null;
  
  function startNewRound() {
    currentGame = createGame(player1, player2);
    render();
  }
  
  function render() {
    const root = document.getElementById('app');
    
    // Si la serie está completa, mostrar resultado final
    if (series.isComplete) {
      let finalMessage = '';
      if (series.winner) {
        finalMessage = `${t('series_winner')}: ${series.winner}`;
      } else {
        finalMessage = t('series_draw');
      }
      
      root.innerHTML = `
        <div class="game">
          <h2>${t('final_score')}</h2>
          <div class="final-score">
            <div class="player-score">${player1}: ${series.scores[player1]} ${t('victories')}</div>
            <div class="player-score">${player2}: ${series.scores[player2]} ${t('victories')}</div>
          </div>
          <h3>${finalMessage}</h3>
          <button id="play-again-btn">${t('play_again')}</button>
          <button id="back-btn">${t('back')}</button>
        </div>
      `;
      
      document.getElementById('play-again-btn').onclick = () => {
        series = createSeries(player1, player2, totalRounds);
        startNewRound();
      };
      document.getElementById('back-btn').onclick = onBack;
      return;
    }
    
    root.innerHTML = `
      <div class="game">
        <div class="series-info">
          <h3>${t('current_round')}: ${series.currentRound} / ${series.totalRounds}</h3>
          <div class="score-display">
            <span>${player1}: ${series.scores[player1]}</span>
            <span>${player2}: ${series.scores[player2]}</span>
          </div>
          <div class="rounds-to-win">${t('rounds_to_win')}: ${series.roundsToWin}</div>
        </div>
        <h2>${t('your_turn')}: ${currentGame.turn}</h2>
        <div class="board">
          ${currentGame.board.map((cell, i) => `
            <div class="cell" data-idx="${i}">${cell !== null ? cell : ''}</div>
          `).join('')}
        </div>
        <div class="numbers">
          <div><b>${player1} (${t('odd')}):</b> ${currentGame.available[player1].join(', ')}</div>
          <div><b>${player2} (${t('even')}):</b> ${currentGame.available[player2].join(', ')}</div>
        </div>
        <div class="pick-number"></div>
        <button id="back-btn">${t('back')}</button>
      </div>
    `;
    
    document.getElementById('back-btn').onclick = onBack;
    
    if (!currentGame.winner && !currentGame.draw) {
      if (isCpu && currentGame.turn === player2) {
        setTimeout(cpuMove, 600);
      } else {
        document.querySelectorAll('.cell').forEach(cell => {
          cell.onclick = () => {
            const idx = parseInt(cell.dataset.idx);
            if (currentGame.board[idx] !== null) return;
            showNumberPicker(idx);
          };
        });
      }
    } else {
      // Ronda terminada
      const roundWinner = currentGame.winner;
      const msg = roundWinner ? `${t('winner')}: ${roundWinner}` : t('draw');
      
      // Actualizar puntuación de la serie
      updateSeriesScore(series, roundWinner);
      
      // Guardar resultado en backend si hay ganador
      if (roundWinner) {
        fetch('/api/game', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ winner: roundWinner, players: [player1, player2] }) });
      }
      
      // Mostrar resultado de la ronda
      document.querySelector('.pick-number').innerHTML = `
        <h3>${msg}</h3>
        <div class="round-result">
          <p>${t('score')}: ${player1} ${series.scores[player1]} - ${series.scores[player2]} ${player2}</p>
        </div>
        <button id="next-round-btn">${t('next')}</button>
      `;
      
      document.getElementById('next-round-btn').onclick = () => {
        if (!series.isComplete) {
          nextRound(series);
          startNewRound();
        } else {
          render(); // Mostrar resultado final
        }
      };
    }
  }

  function showNumberPicker(idx) {
    const pickDiv = document.querySelector('.pick-number');
    const nums = currentGame.available[currentGame.turn];
    pickDiv.innerHTML = `<div>${t('your_turn')}: ${currentGame.turn}<br>${t('select_players')}:<br>${nums.map(n => `<button class="num-btn" data-num="${n}">${n}</button>`).join('')}</div>`;
    document.querySelectorAll('.num-btn').forEach(btn => {
      btn.onclick = () => {
        const num = parseInt(btn.dataset.num);
        makeMove(currentGame, idx, num);
        render();
      };
    });
  }

  function cpuMove() {
    // Elegir movimiento aleatorio válido
    const availableCells = currentGame.board.map((cell, i) => cell === null ? i : null).filter(i => i !== null);
    const availableNumbers = currentGame.available[player2];
    if (availableCells.length === 0 || availableNumbers.length === 0) return;
    const idx = availableCells[Math.floor(Math.random() * availableCells.length)];
    const num = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
    makeMove(currentGame, idx, num);
    render();
  }
  
  // Iniciar la primera ronda
  startNewRound();
}
