/**
 * Memory Game – Full feature set
 * Countdown, combo, hint, lives, undo, stats, symbols, themes, keyboard, confetti, ready countdown.
 */

// ========== CONFIG ==========
const STARTING_SCORE = 100;
const WRONG_PAIR_PENALTY = 4;
const STARTING_LIVES = 3;
const COMBO_BONUS = 5;
const FLIP_BACK_DELAY_MS = 800;
const COUNTDOWN_SECONDS = 60;
const HINT_REVEAL_MS = 1500;
const PAIRS_BY_DIFFICULTY = { easy: 4, medium: 8, hard: 12 };

// Symbol sets (12 symbols each for Hard; Easy/Medium use slice)
const ALL_GREEK = ['Α', 'α', 'Β', 'β', 'Γ', 'γ', 'Δ', 'δ', 'Ε', 'ε', 'Ζ', 'ζ', 'Η', 'η', 'Θ', 'θ', 'Ι', 'ι', 'Κ', 'κ', 'Λ', 'λ', 'Μ', 'μ'];
const ALL_NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const ALL_EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'];
const SYMBOL_SETS = { greek: ALL_GREEK, numbers: ALL_NUMBERS, emojis: ALL_EMOJIS };

// localStorage keys
const KEY_BEST_SCORE = 'memoryGameBestScore';
const KEY_BEST_TIME = 'memoryGameBestTime';
const KEY_STATS = 'memoryGameStats';
const KEY_DARK = 'memoryGameDark';
const KEY_THEME = 'memoryGameTheme';

// ========== DOM ==========
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const movesEl = document.getElementById('moves');
const timerEl = document.getElementById('timer');
const bestScoreEl = document.getElementById('best-score');
const bestTimeEl = document.getElementById('best-time');
const cardGridEl = document.getElementById('card-grid');
const gameMessageEl = document.getElementById('game-message');
const gameOverlayEl = document.getElementById('game-overlay');
const overlayTitleEl = document.getElementById('overlay-title');
const overlayScoreEl = document.getElementById('overlay-score');
const overlayMovesEl = document.getElementById('overlay-moves');
const overlayTimeEl = document.getElementById('overlay-time');
const restartOverlayBtn = document.getElementById('restart-overlay-btn');
const muteBtn = document.getElementById('mute-btn');
const darkBtn = document.getElementById('dark-btn');
const symbolSetEl = document.getElementById('symbol-set');
const themeSetEl = document.getElementById('theme-set');
const gameModeEl = document.getElementById('game-mode');
const countdownCheckEl = document.getElementById('countdown-check');
const hintBtn = document.getElementById('hint-btn');
const undoBtn = document.getElementById('undo-btn');
const restartBtn = document.getElementById('restart-btn');
const restartSameBtn = document.getElementById('restart-same-btn');
const readyOverlayEl = document.getElementById('ready-overlay');
const readyCountEl = document.getElementById('ready-count');
const confettiContainerEl = document.getElementById('confetti-container');
const statScoreEl = document.getElementById('stat-score');
const statLivesEl = document.getElementById('stat-lives');
const statGamesEl = document.getElementById('stat-games');
const statWinsEl = document.getElementById('stat-wins');
const statBestScoreEl = document.getElementById('stat-best-score');
const statBestTimeEl = document.getElementById('stat-best-time');
const scoreHistoryEl = document.getElementById('score-history');

// ========== STATE ==========
let currentScore = STARTING_SCORE;
let currentLives = STARTING_LIVES;
let moves = 0;
let elapsedSeconds = 0;
let timerInterval = null;
let flippedCards = [];
let matchedPairs = 0;
let isGameOver = false;
let canFlip = true;
let gameCanStart = false;
let currentDifficulty = 'medium';
let currentSymbolSet = 'greek';
let currentGameMode = 'score';
let countdownMode = false;
let lastMoveWasMatch = false;
let hintUsed = false;
let undoUsed = false;
let lastWrongPair = null;
let lastScoreBeforeWrong = 0;
let lastLivesBeforeWrong = 0;
let currentDeck = null;
let bestScore = getStored(KEY_BEST_SCORE, null, parseInt);
function parseJson(s, def) {
  try {
    return s != null ? JSON.parse(s) : def;
  } catch (e) {
    return def;
  }
}
let bestTimeByDiff = parseJson(localStorage.getItem(KEY_BEST_TIME), { easy: null, medium: null, hard: null });
let stats = parseJson(localStorage.getItem(KEY_STATS), { games: 0, wins: 0, bestScore: null, bestTime: null, scoreHistory: [] });

function getStored(key, def, parse) {
  try {
    const s = localStorage.getItem(key);
    if (s == null) return def;
    return parse ? parse(s) : s;
  } catch (e) {
    return def;
  }
}

function setStored(key, value) {
  try {
    localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
  } catch (e) {}
}

// ========== DARK MODE & THEME ==========
function applyDarkMode() {
  if (darkBtn && darkBtn.checked) {
    document.body.classList.add('dark');
    setStored(KEY_DARK, '1');
  } else {
    document.body.classList.remove('dark');
    setStored(KEY_DARK, '0');
  }
}

function applyTheme() {
  document.body.classList.remove('theme-ocean', 'theme-forest', 'theme-sunset');
  const t = themeSetEl ? themeSetEl.value : 'default';
  if (t !== 'default') document.body.classList.add('theme-' + t);
  setStored(KEY_THEME, t);
}

if (darkBtn) {
  darkBtn.checked = getStored(KEY_DARK, '0') === '1';
  darkBtn.addEventListener('change', applyDarkMode);
}
applyDarkMode();
if (themeSetEl) {
  themeSetEl.value = getStored(KEY_THEME, 'default');
  themeSetEl.addEventListener('change', applyTheme);
  applyTheme();
}

// ========== SOUND ==========
let audioContext = null;

function getAudioContext() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function playTone(freq, duration, type) {
  if (muteBtn && muteBtn.checked) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = type || 'sine';
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

function playFlip() {
  playTone(400, 0.06);
}

function playMatch() {
  playTone(523, 0.15);
  setTimeout(function () { playTone(659, 0.15); }, 80);
}

function playWrong() {
  playTone(200, 0.2, 'square');
}

function playWin() {
  playTone(523, 0.12);
  setTimeout(function () { playTone(659, 0.12); }, 100);
  setTimeout(function () { playTone(784, 0.2); }, 200);
}

// ========== TIMER (elapsed or countdown) ==========
function startTimer() {
  if (timerInterval) return;
  // Read checkbox when starting so countdown works even if toggled without restart
  countdownMode = countdownCheckEl ? countdownCheckEl.checked : false;
  if (countdownMode) {
    elapsedSeconds = COUNTDOWN_SECONDS;
    timerEl.textContent = formatTime(elapsedSeconds);
    timerInterval = setInterval(function () {
      elapsedSeconds -= 1;
      timerEl.textContent = formatTime(elapsedSeconds);
      if (elapsedSeconds <= 0) {
        stopTimer();
        endGame('lose');
      }
    }, 1000);
  } else {
    elapsedSeconds = 0;
    timerEl.textContent = '0:00';
    timerInterval = setInterval(function () {
      elapsedSeconds += 1;
      timerEl.textContent = formatTime(elapsedSeconds);
    }, 1000);
  }
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function resetTimer() {
  stopTimer();
  elapsedSeconds = countdownMode ? COUNTDOWN_SECONDS : 0;
  timerEl.textContent = formatTime(elapsedSeconds);
}

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m + ':' + (sec < 10 ? '0' : '') + sec;
}

// ========== SYMBOLS & DECK ==========
function getSymbolsForDifficulty() {
  const arr = SYMBOL_SETS[currentSymbolSet] || ALL_GREEK;
  const count = PAIRS_BY_DIFFICULTY[currentDifficulty] || 8;
  return arr.slice(0, Math.min(count, arr.length));
}

function buildDeck(shuffle) {
  const symbols = getSymbolsForDifficulty();
  const deck = [...symbols, ...symbols];
  return shuffle ? shuffleArray(deck) : deck;
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getGridColumns() {
  const pairs = PAIRS_BY_DIFFICULTY[currentDifficulty] || 8;
  const total = pairs * 2;
  if (total <= 8) return 2;
  if (total <= 16) return 4;
  return 6;
}

// ========== READY COUNTDOWN (3, 2, 1, Go!) ==========
function startReadyCountdown(then) {
  if (!readyOverlayEl || !readyCountEl) {
    gameCanStart = true;
    if (then) then();
    return;
  }
  gameCanStart = false;
  readyOverlayEl.classList.remove('hidden');
  readyOverlayEl.setAttribute('aria-hidden', 'false');
  const steps = ['3', '2', '1', 'Go!'];
  let i = 0;
  function next() {
    if (i >= steps.length) {
      readyOverlayEl.classList.add('hidden');
      readyOverlayEl.setAttribute('aria-hidden', 'true');
      gameCanStart = true;
      if (then) then();
      return;
    }
    readyCountEl.textContent = steps[i];
    readyCountEl.style.animation = 'none';
    readyCountEl.offsetHeight;
    readyCountEl.style.animation = 'pop-in 0.5s ease';
    i += 1;
    setTimeout(next, 800);
  }
  next();
}

// ========== CONFETTI ==========
function fireConfetti() {
  if (!confettiContainerEl) return;
  confettiContainerEl.innerHTML = '';
  const colors = ['#2563eb', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899'];
  for (let i = 0; i < 45; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.left = Math.random() * 100 + '%';
    p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDelay = Math.random() * 0.5 + 's';
    p.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
    confettiContainerEl.appendChild(p);
  }
  setTimeout(function () {
    confettiContainerEl.innerHTML = '';
  }, 3000);
}

// ========== MATCH LOGIC ==========
function doCardsMatch(a, b) {
  return a.dataset.symbol === b.dataset.symbol;
}

function checkMatch() {
  moves += 1;
  updateMovesDisplay();

  const [first, second] = flippedCards;
  const match = doCardsMatch(first, second);

  if (match) {
    first.classList.add('matched');
    second.classList.add('matched');
    matchedPairs += 1;
    if (currentGameMode === 'score') {
      if (lastMoveWasMatch) currentScore += COMBO_BONUS;
      currentScore = Math.min(100, currentScore);
      updateScoreDisplay();
    }
    lastMoveWasMatch = true;
    flippedCards = [];
    canFlip = true;
    playMatch();
    checkGameEnd();
  } else {
    lastWrongPair = [first, second];
    lastScoreBeforeWrong = currentScore;
    lastLivesBeforeWrong = currentLives;
    if (currentGameMode === 'score') {
      currentScore = Math.max(0, currentScore - WRONG_PAIR_PENALTY);
      updateScoreDisplay();
    } else {
      currentLives -= 1;
      updateLivesDisplay();
    }
    lastMoveWasMatch = false;
    first.classList.add('wrong');
    second.classList.add('wrong');
    canFlip = false;
    if (undoBtn) undoBtn.disabled = undoUsed;
    playWrong();
    setTimeout(function () {
      first.classList.remove('flipped', 'wrong');
      second.classList.remove('flipped', 'wrong');
      flippedCards = [];
      canFlip = true;
      if (currentGameMode === 'score') updateScoreDisplay();
      else updateLivesDisplay();
      if (undoBtn) undoBtn.disabled = undoUsed;
      checkGameEnd();
    }, FLIP_BACK_DELAY_MS);
  }
}

// ========== UNDO ==========
function doUndo() {
  if (undoUsed || !lastWrongPair) return;
  const [first, second] = lastWrongPair;
  first.classList.remove('flipped', 'wrong');
  second.classList.remove('flipped', 'wrong');
  flippedCards = [];
  canFlip = true;
  if (currentGameMode === 'score') {
    currentScore = lastScoreBeforeWrong;
    updateScoreDisplay();
  } else {
    currentLives = lastLivesBeforeWrong;
    updateLivesDisplay();
  }
  undoUsed = true;
  lastWrongPair = null;
  moves = Math.max(0, moves - 1);
  updateMovesDisplay();
  if (undoBtn) undoBtn.disabled = true;
}

// ========== HINT ==========
function doHint() {
  if (hintUsed || isGameOver || flippedCards.length > 0) return;
  const cards = cardGridEl.querySelectorAll('.card:not(.matched)');
  const bySymbol = {};
  for (let i = 0; i < cards.length; i++) {
    const s = cards[i].dataset.symbol;
    if (!bySymbol[s]) bySymbol[s] = [];
    bySymbol[s].push(cards[i]);
  }
  let pair = null;
  for (const k in bySymbol) {
    if (bySymbol[k].length >= 2) {
      pair = [bySymbol[k][0], bySymbol[k][1]];
      break;
    }
  }
  if (!pair) return;
  hintUsed = true;
  if (hintBtn) hintBtn.disabled = true;
  pair[0].classList.add('flipped', 'hint-reveal');
  pair[1].classList.add('flipped', 'hint-reveal');
  setTimeout(function () {
    pair[0].classList.remove('flipped', 'hint-reveal');
    pair[1].classList.remove('flipped', 'hint-reveal');
    if (hintBtn) hintBtn.disabled = false;
  }, HINT_REVEAL_MS);
}

// ========== GAME END ==========
function checkGameEnd() {
  const pairCount = PAIRS_BY_DIFFICULTY[currentDifficulty] || 8;
  if (matchedPairs === pairCount) {
    endGame('win');
    return;
  }
  if (currentGameMode === 'score' && currentScore <= 0) endGame('lose');
  if (currentGameMode === 'lives' && currentLives <= 0) endGame('lose');
}

function endGame(result) {
  isGameOver = true;
  stopTimer();

  // Time taken to complete (for best time and overlay): in countdown mode = remaining time was COUNTDOWN - elapsed, so time taken = COUNTDOWN - elapsed
  const timeTaken = countdownMode
    ? Math.max(0, COUNTDOWN_SECONDS - elapsedSeconds)
    : elapsedSeconds;

  stats.games += 1;
  if (result === 'win') {
    stats.wins += 1;
    playWin();
    if (currentGameMode === 'score') {
      if (bestScore === null || currentScore > bestScore) {
        bestScore = currentScore;
        setStored(KEY_BEST_SCORE, bestScore);
      }
      if (stats.bestScore === null || currentScore > stats.bestScore) stats.bestScore = currentScore;
    }
    // Best time = how long it took (lower is better)
    const t = timeTaken;
    const key = currentDifficulty;
    if (bestTimeByDiff[key] === null || t < bestTimeByDiff[key]) {
      bestTimeByDiff[key] = t;
      setStored(KEY_BEST_TIME, bestTimeByDiff);
    }
    if (stats.bestTime === null || t < stats.bestTime) stats.bestTime = t;
    fireConfetti();
  }
  if (currentGameMode === 'score' && typeof currentScore === 'number') {
    stats.scoreHistory = (stats.scoreHistory || []).slice(-4);
    stats.scoreHistory.push(currentScore);
  }
  setStored(KEY_STATS, stats);

  if (gameMessageEl) {
    gameMessageEl.classList.remove('hidden');
    gameMessageEl.textContent = result === 'win' ? 'You won! All pairs matched.' : 'Game over.';
    gameMessageEl.className = 'game-message ' + result;
  }
  if (cardGridEl) {
    cardGridEl.querySelectorAll('.card').forEach(function (c) { c.classList.add('disabled'); });
  }
  if (gameOverlayEl) {
    gameOverlayEl.classList.remove('hidden');
    gameOverlayEl.setAttribute('aria-hidden', 'false');
  }
  if (overlayTitleEl) {
    overlayTitleEl.textContent = result === 'win' ? 'You won!' : 'Game over';
    overlayTitleEl.className = result === 'win' ? '' : 'lose';
  }
  if (overlayScoreEl) overlayScoreEl.textContent = 'Score: ' + (currentGameMode === 'score' ? currentScore : '—');
  if (overlayMovesEl) overlayMovesEl.textContent = 'Moves: ' + moves;
  if (overlayTimeEl) overlayTimeEl.textContent = 'Time: ' + formatTime(timeTaken);

  updateStatsPanel();
  updateBestScoreDisplay();
  updateBestTimeDisplay();
}

// ========== DISPLAY UPDATES ==========
function updateScoreDisplay() {
  if (scoreEl) scoreEl.textContent = currentScore;
}

function updateLivesDisplay() {
  if (livesEl) livesEl.textContent = currentLives;
}

function updateMovesDisplay() {
  if (movesEl) movesEl.textContent = moves;
}

function updateBestScoreDisplay() {
  if (bestScoreEl) bestScoreEl.textContent = bestScore !== null ? bestScore : '—';
}

function updateBestTimeDisplay() {
  const t = bestTimeByDiff[currentDifficulty];
  if (bestTimeEl) bestTimeEl.textContent = t !== null ? formatTime(t) : '—';
}

function updateStatsPanel() {
  if (statGamesEl) statGamesEl.textContent = stats.games;
  if (statWinsEl) statWinsEl.textContent = stats.wins;
  if (statBestScoreEl) statBestScoreEl.textContent = stats.bestScore !== null ? stats.bestScore : '—';
  if (statBestTimeEl) statBestTimeEl.textContent = stats.bestTime !== null ? formatTime(stats.bestTime) : '—';
  const hist = stats.scoreHistory || [];
  if (scoreHistoryEl) scoreHistoryEl.textContent = hist.length ? hist.join(', ') : '—';
}

function updateModeVisibility() {
  if (statScoreEl) statScoreEl.classList.toggle('hidden', currentGameMode === 'lives');
  if (statLivesEl) statLivesEl.classList.toggle('hidden', currentGameMode === 'score');
}

// ========== RENDER CARDS ==========
function renderCards(useSameBoard) {
  const deck = useSameBoard && currentDeck && currentDeck.length > 0
    ? currentDeck
    : buildDeck(true);
  if (!useSameBoard || !currentDeck) currentDeck = [...deck];

  const cols = getGridColumns();
  cardGridEl.innerHTML = '';
  cardGridEl.className = 'card-grid cols-' + cols;

  deck.forEach(function (symbol, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-symbol', String(symbol));
    card.setAttribute('data-index', index);
    card.setAttribute('role', 'gridcell');
    card.setAttribute('tabindex', '0');

    card.innerHTML =
      '<div class="card-inner">' +
        '<div class="card-face card-back"></div>' +
        '<div class="card-face card-front">' + symbol + '</div>' +
      '</div>';

    card.addEventListener('click', handleCardClick);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
    cardGridEl.appendChild(card);
  });

  // Keyboard nav: arrow keys move focus between cards
  const cards = cardGridEl.querySelectorAll('.card');
  cardGridEl.setAttribute('aria-label', 'Memory cards. Use arrow keys to move, Enter or Space to flip.');
  cards.forEach(function (card, i) {
    card.addEventListener('keydown', function (e) {
      const len = cards.length;
      const colsCount = cols;
      let next = -1;
      if (e.key === 'ArrowRight') next = (i + 1) % len;
      if (e.key === 'ArrowLeft') next = (i - 1 + len) % len;
      if (e.key === 'ArrowDown') next = (i + colsCount) % len;
      if (e.key === 'ArrowUp') next = (i - colsCount + len) % len;
      if (next >= 0 && next !== i) {
        e.preventDefault();
        cards[next].focus();
      }
    });
  });
}

// ========== CARD CLICK ==========
function handleCardClick(event) {
  if (!gameCanStart || isGameOver || !canFlip) return;

  const card = event.currentTarget;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

  startTimer(); // Start on first card flip (elapsed or countdown)
  playFlip();
  card.classList.add('flipped');
  flippedCards.push(card);

  if (flippedCards.length === 2) checkMatch();
}

// ========== RESTART ==========
function restartGame(forceNewShuffle) {
  currentScore = STARTING_SCORE;
  currentLives = STARTING_LIVES;
  moves = 0;
  flippedCards = [];
  matchedPairs = 0;
  isGameOver = false;
  canFlip = true;
  gameCanStart = false;
  hintUsed = false;
  undoUsed = false;
  lastWrongPair = null;
  lastMoveWasMatch = false;

  countdownMode = countdownCheckEl ? countdownCheckEl.checked : false;
  resetTimer();
  updateScoreDisplay();
  updateLivesDisplay();
  updateMovesDisplay();
  updateBestScoreDisplay();
  updateBestTimeDisplay();
  updateModeVisibility();

  gameMessageEl.classList.add('hidden');
  gameMessageEl.className = 'game-message hidden';
  gameOverlayEl.classList.add('hidden');
  gameOverlayEl.setAttribute('aria-hidden', 'true');
  if (hintBtn) hintBtn.disabled = false;
  if (undoBtn) undoBtn.disabled = true;

  const useSameBoard = forceNewShuffle === false;
  renderCards(useSameBoard);

  startReadyCountdown(function () {
    const useCountdown = countdownCheckEl ? countdownCheckEl.checked : false;
    if (useCountdown) {
      elapsedSeconds = COUNTDOWN_SECONDS;
      timerEl.textContent = formatTime(COUNTDOWN_SECONDS);
    }
  });
}

// ========== OPTIONS CHANGE ==========
function setDifficulty(difficulty) {
  currentDifficulty = difficulty;
  document.querySelectorAll('.btn-difficulty').forEach(function (btn) {
    btn.classList.toggle('active', btn.getAttribute('data-difficulty') === difficulty);
  });
  restartGame(true);
}

function onSymbolSetChange() {
  currentSymbolSet = symbolSetEl ? symbolSetEl.value : 'greek';
  restartGame(true);
}

function onGameModeChange() {
  currentGameMode = gameModeEl ? gameModeEl.value : 'score';
  updateModeVisibility();
  restartGame(true);
}

// ========== INIT ==========
const navbarRestartBtn = document.getElementById('navbar-restart-btn');
if (restartBtn) restartBtn.addEventListener('click', function () { restartGame(true); });
if (restartSameBtn) restartSameBtn.addEventListener('click', function () { restartGame(false); });
if (restartOverlayBtn) restartOverlayBtn.addEventListener('click', function () { restartGame(true); });
if (navbarRestartBtn) navbarRestartBtn.addEventListener('click', function () { restartGame(true); });

document.querySelectorAll('.btn-difficulty').forEach(function (btn) {
  btn.addEventListener('click', function () {
    setDifficulty(btn.getAttribute('data-difficulty'));
  });
});

if (symbolSetEl) symbolSetEl.addEventListener('change', onSymbolSetChange);
if (gameModeEl) gameModeEl.addEventListener('change', onGameModeChange);
if (hintBtn) hintBtn.addEventListener('click', doHint);
if (undoBtn) undoBtn.addEventListener('click', doUndo);

document.addEventListener('keydown', function (e) {
  if (e.key === 'r' || e.key === 'R') {
    if (!gameOverlayEl.classList.contains('hidden')) return;
    restartGame(true);
  }
  if (e.key === 'h' || e.key === 'H') doHint();
});

updateScoreDisplay();
updateLivesDisplay();
updateMovesDisplay();
updateBestScoreDisplay();
updateBestTimeDisplay();
updateStatsPanel();
updateModeVisibility();
renderCards(false);
startReadyCountdown();
