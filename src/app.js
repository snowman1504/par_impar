import { loadLang, t } from './ui.js';
import { showMenu, showRegister, showGame, showHelp, showStats, showRoundsSelector } from './ui.js';

let lang = localStorage.getItem('lang') || 'es';
let player1 = null;
let player2 = null;

async function main() {
  await loadLang(lang);
  showLanguageSelector();
}

function showLanguageSelector() {
  const root = document.getElementById('app');
  root.innerHTML = `
    <div class="lang-select">
      <h2>${t('select_language')}</h2>
      <button id="lang-es">Español</button>
      <button id="lang-en">English</button>
    </div>
  `;
  document.getElementById('lang-es').onclick = () => setLang('es');
  document.getElementById('lang-en').onclick = () => setLang('en');
}

async function setLang(l) {
  lang = l;
  localStorage.setItem('lang', lang);
  await loadLang(lang);
  showSingleRegister();
}

function showSingleRegister() {
  const root = document.getElementById('app');
  root.innerHTML = `
    <div class="register">
      <h2>${t('register')}</h2>
      <input id="player1" placeholder="${t('player_name')}" />
      <button id="register-btn">${t('confirm')}</button>
      <button id="help-btn">${t('manual')}</button>
    </div>
  `;
  document.getElementById('register-btn').onclick = async () => {
    const p1 = document.getElementById('player1').value.trim();
    if (!p1) {
      alert(t('invalid_names'));
      return;
    }
    try {
      const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: p1 }) });
      const data = await res.json();
      if (!res.ok && data.error !== 'Player already exists') throw new Error(data.error || 'Error');
      player1 = p1;
      showGameModeMenu();
    } catch (err) {
      alert(t(err.message) || err.message);
    }
  };
  document.getElementById('help-btn').onclick = () => showHelp(lang, showSingleRegister);
}

function showGameModeMenu() {
  const root = document.getElementById('app');
  root.innerHTML = `
    <div class="menu">
      <h1>${t('select_mode')}</h1>
      <button id="cpu-btn">${t('play_vs_device')}</button>
      <button id="player-btn">${t('play_vs_player')}</button>
      <button id="online-btn">${t('play_online')}</button>
      <button id="help-btn">${t('manual')}</button>
      <button id="exit-btn">${t('exit')}</button>
    </div>
  `;
  document.getElementById('cpu-btn').onclick = () => showRoundsSelector('cpu', showGameModeMenu);
  document.getElementById('player-btn').onclick = () => showRegister(startMenu, showGameModeMenu);
  document.getElementById('online-btn').onclick = () => showMenu({
    onPlay: () => {},
    onHelp: () => showHelp(lang, showGameModeMenu),
    onStats: () => showStats(lang, showGameModeMenu),
    onExit: () => showGameModeMenu()
  });
  document.getElementById('help-btn').onclick = () => showHelp(lang, showGameModeMenu);
  document.getElementById('exit-btn').onclick = () => showLanguageSelector();
}

function startCpuGame(rounds) {
  const cpuName = 'CPU';
  showGame(player1, cpuName, lang, showGameModeMenu, true, rounds);
}

function startPlayerGame(rounds) {
  showGame(player1, player2, lang, startMenu, false, rounds);
}

function startMenu(p1, p2) {
  player1 = p1;
  player2 = p2;
  showMenu({
    onPlay: () => showRoundsSelector('player', () => showMenu({ onPlay: () => showRoundsSelector('player', startMenu), onHelp: () => showHelp(lang, startMenu), onStats: () => showStats(lang, startMenu), onExit: () => showLanguageSelector() })),
    onHelp: () => showHelp(lang, startMenu),
    onStats: () => showStats(lang, startMenu),
    onExit: () => showLanguageSelector()
  });
}

// Exponer funciones globalmente para que showRoundsSelector pueda acceder a ellas
window.startCpuGame = startCpuGame;
window.startPlayerGame = startPlayerGame;

main();
