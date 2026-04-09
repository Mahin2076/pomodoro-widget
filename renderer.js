// ── Settings ──────────────────────────────────────────────────
const DEFAULTS = {
  workMinutes: window.env?.workMinutes ?? 25,
  shortBreakMinutes: window.env?.shortBreakMinutes ?? 5,
  longBreakMinutes: window.env?.longBreakMinutes ?? 15,
  soundEnabled: window.env?.soundEnabled ?? true,
};

function loadSettings() {
  return {
    workMinutes: parseInt(localStorage.getItem('workMinutes')) || DEFAULTS.workMinutes,
    shortBreakMinutes: parseInt(localStorage.getItem('shortBreakMinutes')) || DEFAULTS.shortBreakMinutes,
    longBreakMinutes: parseInt(localStorage.getItem('longBreakMinutes')) || DEFAULTS.longBreakMinutes,
    soundEnabled: localStorage.getItem('soundEnabled') !== null
      ? localStorage.getItem('soundEnabled') === 'true'
      : DEFAULTS.soundEnabled,
  };
}

function saveSettings(s) {
  localStorage.setItem('workMinutes', s.workMinutes);
  localStorage.setItem('shortBreakMinutes', s.shortBreakMinutes);
  localStorage.setItem('longBreakMinutes', s.longBreakMinutes);
  localStorage.setItem('soundEnabled', s.soundEnabled);
}

let settings = loadSettings();

// ── DOM refs ──────────────────────────────────────────────────
const elMode       = document.getElementById('mode-label');
const elTimer      = document.getElementById('timer-display');
const elBtnPlay    = document.getElementById('btn-playpause');
const elBtnSkip    = document.getElementById('btn-skip');
const elTomato     = document.getElementById('tomato');
const elConfetti   = document.getElementById('confetti-container');
const elPanel      = document.getElementById('settings-panel');
const elSetWork    = document.getElementById('set-work');
const elSetShort   = document.getElementById('set-short');
const elSetLong    = document.getElementById('set-long');
const elSetSound   = document.getElementById('set-sound');
const elApply      = document.getElementById('settings-apply');
const elWidget     = document.getElementById('widget');

// ── Settings panel UI ─────────────────────────────────────────
function openSettings() {
  elSetWork.value  = settings.workMinutes;
  elSetShort.value = settings.shortBreakMinutes;
  elSetLong.value  = settings.longBreakMinutes;
  elSetSound.checked = settings.soundEnabled;
  elPanel.classList.remove('hidden');
  // force reflow before adding visible so transition fires
  elPanel.offsetHeight;
  elPanel.classList.add('visible');
}

function closeSettings() {
  elPanel.classList.remove('visible');
  setTimeout(() => elPanel.classList.add('hidden'), 150);
}

elApply.addEventListener('click', () => {
  settings = {
    workMinutes: Math.max(1, parseInt(elSetWork.value) || DEFAULTS.workMinutes),
    shortBreakMinutes: Math.max(1, parseInt(elSetShort.value) || DEFAULTS.shortBreakMinutes),
    longBreakMinutes: Math.max(1, parseInt(elSetLong.value) || DEFAULTS.longBreakMinutes),
    soundEnabled: elSetSound.checked,
  };
  saveSettings(settings);
  closeSettings();
});

elWidget.addEventListener('click', (e) => {
  // Only open if click target is not a button or input
  if (e.target.closest('button') || e.target.closest('input')) return;
  openSettings();
});

document.addEventListener('click', (e) => {
  if (!elPanel.classList.contains('hidden') && !elPanel.contains(e.target) && !elWidget.contains(e.target)) {
    closeSettings();
  }
});

// ── Session cycle ─────────────────────────────────────────────
// Cycle: W SB W SB W SB W LB (repeat)
const CYCLE = ['work','short','work','short','work','short','work','long'];
let cycleIndex = 0;

function currentMode() { return CYCLE[cycleIndex]; }

function modeDuration() {
  switch (currentMode()) {
    case 'work':  return settings.workMinutes * 60;
    case 'short': return settings.shortBreakMinutes * 60;
    case 'long':  return settings.longBreakMinutes * 60;
  }
}

function modeLabel() {
  switch (currentMode()) {
    case 'work':  return 'WORK';
    case 'short': return 'SHORT BREAK';
    case 'long':  return 'LONG BREAK';
  }
}

function advanceCycle() {
  cycleIndex = (cycleIndex + 1) % CYCLE.length;
}

// ── Timer state machine ───────────────────────────────────────
// states: idle | running | paused | ended
let timerState = 'idle';
let secondsLeft = 0;
let intervalId  = null;

function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function renderTimerDisplay() {
  elTimer.textContent = formatTime(secondsLeft);
  elMode.textContent  = modeLabel();
  elBtnPlay.textContent = timerState === 'running' ? '⏸' : '▶';
}

function initSession() {
  timerState  = 'idle';
  secondsLeft = modeDuration();
  renderTimerDisplay();
}

function startTimer() {
  if (timerState === 'ended') return;
  timerState = 'running';
  elBtnPlay.textContent = '⏸';
  intervalId = setInterval(() => {
    secondsLeft--;
    renderTimerDisplay();
    if (secondsLeft <= 0) endSession();
  }, 1000);
}

function pauseTimer() {
  timerState = 'paused';
  clearInterval(intervalId);
  elBtnPlay.textContent = '▶';
}

function endSession() {
  clearInterval(intervalId);
  timerState = 'ended';
  secondsLeft = 0;
  renderTimerDisplay();
  playChime();
  triggerCelebration();
  setTimeout(() => {
    advanceCycle();
    initSession();
  }, 3000);
}

function skipSession() {
  clearInterval(intervalId);
  advanceCycle();
  initSession();
}

// ── Button handlers ───────────────────────────────────────────
elBtnPlay.addEventListener('click', (e) => {
  e.stopPropagation();
  if (timerState === 'running') pauseTimer();
  else if (timerState === 'idle' || timerState === 'paused') startTimer();
});

elBtnSkip.addEventListener('click', (e) => {
  e.stopPropagation();
  skipSession();
});

// ── Init ──────────────────────────────────────────────────────
initSession();

// ── Web Audio chime ───────────────────────────────────────────
function playChime() {
  if (!settings.soundEnabled) return;
  const ctx = new AudioContext();
  const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
  notes.forEach((freq, i) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.18);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.25);
    osc.start(ctx.currentTime + i * 0.18);
    osc.stop(ctx.currentTime + i * 0.18 + 0.3);
  });
}

// ── Confetti celebration ──────────────────────────────────────
const CONFETTI_COLORS = ['#ff4444','#ffaa00','#44ff88','#44aaff','#ff44ff','#ffffff'];

function triggerCelebration() {
  // Switch tomato to celebrate animation
  elTomato.classList.add('celebrating');
  elTomato.addEventListener('animationend', () => {
    elTomato.classList.remove('celebrating');
  }, { once: true });

  // Spawn confetti pieces
  elConfetti.innerHTML = '';
  for (let i = 0; i < 20; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const angle = Math.random() * 360;
    const dist  = 30 + Math.random() * 40;
    const tx = Math.round(Math.cos(angle * Math.PI / 180) * dist);
    const ty = Math.round(Math.sin(angle * Math.PI / 180) * dist);
    piece.style.setProperty('--tx', `${tx}px`);
    piece.style.setProperty('--ty', `${ty}px`);
    piece.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    piece.style.animationDelay = `${Math.random() * 0.2}s`;
    elConfetti.appendChild(piece);
  }
  setTimeout(() => { elConfetti.innerHTML = ''; }, 1200);
}
