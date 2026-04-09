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
