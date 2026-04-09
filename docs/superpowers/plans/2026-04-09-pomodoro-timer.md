# Cute Pixelated Tomato Pomodoro Timer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a frameless, always-on-top Electron desktop widget with a CSS pixel-art tomato, timer state machine, customizable session times, and a retro 8-bit chime.

**Architecture:** Electron main process creates a frameless transparent window; a minimal preload bridge exposes `.env` defaults; all UI/logic lives in plain HTML+CSS+JS in the renderer. No frameworks, no bundler.

**Tech Stack:** Electron 41, HTML5, CSS3 (box-shadow pixel art, keyframe animations), vanilla JS (Web Audio API, localStorage, setInterval)

---

## File Map

| File | Responsibility |
|---|---|
| `main.js` | Electron main process — window creation, always-on-top, loads preload |
| `preload.js` | contextBridge — exposes `.env` values as `window.env` |
| `index.html` | Shell — imports font, style.css, renderer.js; declares DOM structure |
| `style.css` | Pixel tomato (box-shadow grid), keyframe animations, settings panel, timer display |
| `renderer.js` | Timer state machine, session cycle, settings load/save, Web Audio chime, confetti |

---

## Task 1: Fix package.json and scaffold Electron main process

**Files:**
- Modify: `package.json`
- Create: `main.js`

- [ ] **Step 1: Fix package.json entry point and add start script**

Replace contents of `package.json`:
```json
{
  "name": "cute-pomodoro-timer",
  "version": "1.0.0",
  "description": "Cute pixelated tomato Pomodoro timer",
  "main": "main.js",
  "scripts": {
    "start": "electron ."
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "devDependencies": {
    "electron": "^41.2.0"
  }
}
```

- [ ] **Step 2: Create main.js**

```js
const { app, BrowserWindow } = require('electron');
const path = require('path');
require('dotenv').config();

function createWindow() {
  const win = new BrowserWindow({
    width: 200,
    height: 260,
    frame: false,
    transparent: true,
    alwaysOnTop: process.env.ALWAYS_ON_TOP !== 'false',
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});
```

- [ ] **Step 3: Install dotenv**

```bash
cd "/Users/mahinb/Cute Pomodoro timer" && npm install dotenv
```

Expected: dotenv added to node_modules, package-lock.json updated.

- [ ] **Step 4: Verify app launches**

```bash
cd "/Users/mahinb/Cute Pomodoro timer" && npm start
```

Expected: Electron window opens (blank or white — index.html doesn't exist yet, expect a file-not-found error in the window, but the process should not crash). Close the window.

- [ ] **Step 5: Commit**

```bash
cd "/Users/mahinb/Cute Pomodoro timer" && git init && git add main.js package.json package-lock.json && git commit -m "feat: scaffold Electron main process with frameless transparent window"
```

---

## Task 2: Create preload.js IPC bridge

**Files:**
- Create: `preload.js`

- [ ] **Step 1: Create preload.js**

```js
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('env', {
  workMinutes: parseInt(process.env.DEFAULT_WORK_MINUTES) || 25,
  shortBreakMinutes: parseInt(process.env.DEFAULT_SHORT_BREAK_MINUTES) || 5,
  longBreakMinutes: parseInt(process.env.DEFAULT_LONG_BREAK_MINUTES) || 15,
  autoTransition: process.env.DEFAULT_AUTO_TRANSITION === 'true',
  alwaysOnTop: process.env.ALWAYS_ON_TOP !== 'false',
  notificationsEnabled: process.env.NOTIFICATIONS_ENABLED !== 'false',
  soundEnabled: process.env.SOUND_ENABLED !== 'false',
});
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/mahinb/Cute Pomodoro timer" && git add preload.js && git commit -m "feat: add preload IPC bridge exposing env defaults to renderer"
```

---

## Task 3: Create index.html shell

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'">
  <title>Pomodoro</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app">
    <!-- Settings panel -->
    <div id="settings-panel" class="hidden">
      <div class="settings-title">Settings</div>
      <label>Work (min)<input id="set-work" type="number" min="1" max="99" /></label>
      <label>Short Break<input id="set-short" type="number" min="1" max="99" /></label>
      <label>Long Break<input id="set-long" type="number" min="1" max="99" /></label>
      <label class="sound-toggle">
        Sound <input id="set-sound" type="checkbox" />
      </label>
      <button id="settings-apply">Apply</button>
    </div>

    <!-- Main widget -->
    <div id="widget">
      <div id="mode-label">WORK</div>
      <div id="tomato-wrap">
        <div id="tomato"></div>
        <div id="confetti-container"></div>
      </div>
      <div id="timer-display">25:00</div>
      <div id="controls">
        <button id="btn-playpause" class="nodrag">▶</button>
        <button id="btn-skip" class="nodrag">⏭</button>
      </div>
    </div>
  </div>
  <script src="renderer.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/mahinb/Cute Pomodoro timer" && git add index.html && git commit -m "feat: add index.html shell with widget and settings panel DOM"
```

---

## Task 4: Build pixel tomato and base styles in style.css

**Files:**
- Create: `style.css`

- [ ] **Step 1: Create style.css with reset, layout, and pixel tomato**

```css
/* ── Reset & Base ── */
* { margin: 0; padding: 0; box-sizing: border-box; }

html, body {
  width: 200px;
  height: 260px;
  overflow: hidden;
  background: transparent;
  font-family: 'Press Start 2P', monospace;
}

#app {
  width: 200px;
  height: 260px;
  position: relative;
  -webkit-app-region: drag;
}

/* ── Widget layout ── */
#widget {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
  background: rgba(20, 10, 10, 0.72);
  border-radius: 16px;
  border: 2px solid rgba(255, 80, 60, 0.4);
  backdrop-filter: blur(8px);
}

/* ── Mode label ── */
#mode-label {
  font-size: 7px;
  color: #ff9980;
  letter-spacing: 2px;
  -webkit-app-region: no-drag;
}

/* ── Tomato wrap ── */
#tomato-wrap {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Pixel tomato via box-shadow ──
   Each entry: X Y 0 0 color
   Grid cell size = 8px, origin div is 8x8px top-left at (0,0)
   Tomato is 10 cols × 11 rows (80px × 88px), centered
*/
#tomato {
  width: 8px;
  height: 8px;
  position: absolute;
  top: -4px;
  left: -4px;
  /* Generated pixel art: dark outline, red body, green stem/leaf */
  box-shadow:
    /* Row 0 - stem */
    24px 0px 0 0 #2d7a2d,
    32px 0px 0 0 #2d7a2d,

    /* Row 1 - leaf */
    16px 8px 0 0 #3aaa3a,
    24px 8px 0 0 #3aaa3a,
    32px 8px 0 0 #3aaa3a,
    40px 8px 0 0 #3aaa3a,

    /* Row 2 - outline top */
    8px  16px 0 0 #1a1a1a,
    16px 16px 0 0 #1a1a1a,
    24px 16px 0 0 #1a1a1a,
    32px 16px 0 0 #1a1a1a,
    40px 16px 0 0 #1a1a1a,
    48px 16px 0 0 #1a1a1a,
    56px 16px 0 0 #1a1a1a,

    /* Row 3 */
    0px  24px 0 0 #1a1a1a,
    8px  24px 0 0 #e83030,
    16px 24px 0 0 #e83030,
    24px 24px 0 0 #ff6a6a,
    32px 24px 0 0 #e83030,
    40px 24px 0 0 #e83030,
    48px 24px 0 0 #e83030,
    56px 24px 0 0 #e83030,
    64px 24px 0 0 #1a1a1a,

    /* Row 4 */
    0px  32px 0 0 #1a1a1a,
    8px  32px 0 0 #e83030,
    16px 32px 0 0 #ff6a6a,
    24px 32px 0 0 #ff6a6a,
    32px 32px 0 0 #e83030,
    40px 32px 0 0 #e83030,
    48px 32px 0 0 #e83030,
    56px 32px 0 0 #e83030,
    64px 32px 0 0 #1a1a1a,

    /* Row 5 */
    0px  40px 0 0 #1a1a1a,
    8px  40px 0 0 #c82020,
    16px 40px 0 0 #e83030,
    24px 40px 0 0 #e83030,
    32px 40px 0 0 #e83030,
    40px 40px 0 0 #e83030,
    48px 40px 0 0 #e83030,
    56px 40px 0 0 #c82020,
    64px 40px 0 0 #1a1a1a,

    /* Row 6 */
    0px  48px 0 0 #1a1a1a,
    8px  48px 0 0 #c82020,
    16px 48px 0 0 #e83030,
    24px 48px 0 0 #e83030,
    32px 48px 0 0 #e83030,
    40px 48px 0 0 #e83030,
    48px 48px 0 0 #e83030,
    56px 48px 0 0 #c82020,
    64px 48px 0 0 #1a1a1a,

    /* Row 7 */
    0px  56px 0 0 #1a1a1a,
    8px  56px 0 0 #c82020,
    16px 56px 0 0 #c82020,
    24px 56px 0 0 #e83030,
    32px 56px 0 0 #e83030,
    40px 56px 0 0 #e83030,
    48px 56px 0 0 #c82020,
    56px 56px 0 0 #c82020,
    64px 56px 0 0 #1a1a1a,

    /* Row 8 - outline bottom curve */
    8px  64px 0 0 #1a1a1a,
    16px 64px 0 0 #c82020,
    24px 64px 0 0 #c82020,
    32px 64px 0 0 #c82020,
    40px 64px 0 0 #c82020,
    48px 64px 0 0 #c82020,
    56px 64px 0 0 #1a1a1a,

    /* Row 9 - bottom outline */
    16px 72px 0 0 #1a1a1a,
    24px 72px 0 0 #1a1a1a,
    32px 72px 0 0 #1a1a1a,
    40px 72px 0 0 #1a1a1a,
    48px 72px 0 0 #1a1a1a;
}

/* ── Timer display ── */
#timer-display {
  font-size: 20px;
  color: #ffffff;
  letter-spacing: 2px;
  -webkit-app-region: no-drag;
}

/* ── Controls ── */
#controls {
  display: flex;
  gap: 12px;
  -webkit-app-region: no-drag;
}

#controls button {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,100,80,0.4);
  color: #ff9980;
  font-size: 14px;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  -webkit-app-region: no-drag;
}

#controls button:hover {
  background: rgba(255,100,80,0.2);
}

/* ── Animations ── */
@keyframes bob {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-6px); }
}

@keyframes celebrate {
  0%   { transform: rotate(0deg) scale(1); }
  25%  { transform: rotate(15deg) scale(1.2); }
  50%  { transform: rotate(-15deg) scale(1.3); }
  75%  { transform: rotate(10deg) scale(1.15); }
  100% { transform: rotate(0deg) scale(1); }
}

@keyframes confetti-fall {
  0%   { transform: translate(0, 0) rotate(0deg); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) rotate(720deg); opacity: 0; }
}

#tomato {
  animation: bob 1s ease-in-out infinite;
}

#tomato.celebrating {
  animation: celebrate 0.6s ease-in-out 3;
}

/* ── Confetti pieces ── */
.confetti-piece {
  position: absolute;
  width: 6px;
  height: 6px;
  top: 50%;
  left: 50%;
  animation: confetti-fall 0.8s ease-out forwards;
}

/* ── Settings panel ── */
#settings-panel {
  position: absolute;
  inset: 0;
  background: rgba(15, 8, 8, 0.95);
  border-radius: 16px;
  border: 2px solid rgba(255, 80, 60, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  z-index: 10;
  padding: 16px;
  -webkit-app-region: no-drag;
  transform: scale(0.9);
  opacity: 0;
  transition: opacity 0.15s ease, transform 0.15s ease;
  pointer-events: none;
}

#settings-panel.visible {
  transform: scale(1);
  opacity: 1;
  pointer-events: all;
}

#settings-panel.hidden {
  display: none;
}

.settings-title {
  font-size: 8px;
  color: #ff9980;
  letter-spacing: 2px;
  margin-bottom: 4px;
}

#settings-panel label {
  font-size: 6px;
  color: #ccc;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
}

#settings-panel input[type="number"] {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,100,80,0.4);
  color: #fff;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  padding: 4px 6px;
  width: 60px;
  text-align: center;
  border-radius: 4px;
}

.sound-toggle {
  flex-direction: row !important;
  gap: 8px !important;
}

#settings-panel input[type="checkbox"] {
  width: 14px;
  height: 14px;
  accent-color: #ff6a6a;
}

#settings-apply {
  margin-top: 4px;
  background: rgba(255,100,80,0.3);
  border: 1px solid rgba(255,100,80,0.6);
  color: #ff9980;
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  -webkit-app-region: no-drag;
}

#settings-apply:hover {
  background: rgba(255,100,80,0.5);
}
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/mahinb/Cute Pomodoro timer" && git add style.css && git commit -m "feat: add pixel tomato CSS art, animations, settings panel styles"
```

---

## Task 5: Build renderer.js — settings load/save

**Files:**
- Create: `renderer.js` (partial — settings only this task)

- [ ] **Step 1: Create renderer.js with settings management**

```js
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
```

- [ ] **Step 2: Verify the app launches and settings panel opens on click**

```bash
cd "/Users/mahinb/Cute Pomodoro timer" && npm start
```

Click the dark widget area — settings panel should slide in. Click Apply — panel closes. Close window.

- [ ] **Step 3: Commit**

```bash
cd "/Users/mahinb/Cute Pomodoro timer" && git add renderer.js && git commit -m "feat: add settings load/save and settings panel open/close logic"
```

---

## Task 6: Build renderer.js — timer state machine and session cycle

**Files:**
- Modify: `renderer.js`

- [ ] **Step 1: Append timer state machine to renderer.js**

Add the following at the bottom of `renderer.js`:

```js
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
```

- [ ] **Step 2: Verify timer counts down**

```bash
cd "/Users/mahinb/Cute Pomodoro timer" && npm start
```

- Press ▶ — timer counts down from 25:00
- Press ⏸ — pauses
- Press ▶ again — resumes
- Press ⏭ — skips to next mode (SHORT BREAK)
- Close window.

- [ ] **Step 3: Commit**

```bash
cd "/Users/mahinb/Cute Pomodoro timer" && git add renderer.js && git commit -m "feat: add timer state machine and session cycle"
```

---

## Task 7: Build renderer.js — Web Audio chime and confetti celebration

**Files:**
- Modify: `renderer.js`

- [ ] **Step 1: Append playChime and triggerCelebration to renderer.js**

Add the following at the bottom of `renderer.js`:

```js
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
```

- [ ] **Step 2: Test end-of-session celebration**

To test without waiting 25 minutes, temporarily change `secondsLeft` in `initSession()` to `5` and run:

```bash
cd "/Users/mahinb/Cute Pomodoro timer" && npm start
```

- Press ▶, wait 5 seconds
- Verify: chime plays, tomato spins, confetti bursts out, timer auto-advances to SHORT BREAK after 3s
- Revert `secondsLeft` back to `modeDuration()` after testing

- [ ] **Step 3: Commit**

```bash
cd "/Users/mahinb/Cute Pomodoro timer" && git add renderer.js && git commit -m "feat: add Web Audio 8-bit chime and confetti celebration animation"
```

---

## Task 8: Final polish and verification

**Files:**
- Modify: `main.js` (minor — ensure dotenv loads correctly)

- [ ] **Step 1: Confirm .env is loaded in main.js**

Open `main.js` — verify `require('dotenv').config()` is at the top before `createWindow`. This should already be there from Task 1.

- [ ] **Step 2: Full end-to-end manual verification**

```bash
cd "/Users/mahinb/Cute Pomodoro timer" && npm start
```

Verify each item:
- [ ] Widget appears — frameless, dark semi-transparent, rounded corners
- [ ] Tomato pixel art visible and gently bobbing
- [ ] Timer shows correct default time (25:00)
- [ ] Mode label shows WORK
- [ ] ▶ starts countdown, ⏸ pauses, ▶ resumes
- [ ] ⏭ skips to next mode (SHORT BREAK, then WORK, etc.)
- [ ] Clicking widget opens settings panel with slide-in animation
- [ ] Changing values and pressing Apply saves them (verify by reopening settings)
- [ ] Sound checkbox toggles chime
- [ ] Widget is draggable across the desktop
- [ ] Window stays always on top of other apps

- [ ] **Step 3: Final commit**

```bash
cd "/Users/mahinb/Cute Pomodoro timer" && git add -A && git commit -m "feat: complete cute pixelated tomato Pomodoro timer"
```
