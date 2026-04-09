# Cute Pixelated Tomato Pomodoro Timer — Design Spec

**Date:** 2026-04-09  
**Status:** Approved

---

## Overview

A desktop widget-style Pomodoro timer built with Electron. Frameless, transparent, always-on-top window featuring a CSS pixel-art tomato mascot with animations, customizable session times, and a retro 8-bit chime on session end.

---

## Architecture

5 files, all plain HTML/CSS/JS inside Electron — no frameworks, no bundler.

```
main.js        — Electron main process: creates frameless window, always-on-top, loads preload
preload.js     — Minimal contextBridge IPC: exposes .env defaults to renderer
index.html     — Shell document: loads style.css and renderer.js
style.css      — Pixel tomato (CSS box-shadow grid), animations, settings panel, timer display
renderer.js    — Timer state machine, settings management, Web Audio chime
```

---

## Window

- Size: ~200×250px
- Frameless, transparent background
- Always on top
- Draggable from anywhere on the widget (`-webkit-app-region: drag` on container, `no-drag` on interactive elements)

---

## Pixel Tomato

- Rendered as a CSS `box-shadow` grid on a single `<div>`, 16×16 pixel cells scaled up (~8–10px per cell)
- Colors: red body, green leaf stem, dark pixel outline
- **Idle animation**: gentle bob (translate Y up/down, ~1s loop, CSS keyframes)
- **Celebration animation** (on session end): spin + scale pulse + pixel confetti burst (small `<div>` elements scattered via JS with CSS animation)

---

## Timer Display

- Font: pixel/monospace (Google Fonts "Press Start 2P" or CSS fallback)
- Format: `MM:SS`
- Mode label above or below: `WORK`, `SHORT BREAK`, `LONG BREAK`
- Play/pause button and skip button beneath the display — small, minimal

---

## Session Cycle

Fixed cycle, repeats indefinitely:

```
Work → Short Break → Work → Short Break → Work → Short Break → Work → Long Break → (repeat)
```

Long break triggers every 4th work session.

---

## Timer State Machine

States: `idle → running → paused → ended`

- `idle`: Timer loaded, not started. Shows full duration.
- `running`: Countdown active via `setInterval`.
- `paused`: Interval cleared, time preserved.
- `ended`: Countdown reached 0. Chime plays, celebration animation fires, auto-advances to next session after 3s.

---

## Settings Panel

- Triggered by clicking anywhere on the widget (excluding controls)
- Slides in as an overlay panel on the widget
- Clicking outside the panel dismisses it
- Contains three labeled number inputs:
  - Work (minutes)
  - Short Break (minutes)
  - Long Break (minutes)
- Apply button saves to `localStorage` and dismisses panel
- Changes take effect on the next session start (not mid-session)

---

## Settings Data Flow

1. On startup: `preload.js` exposes `.env` values via `contextBridge`
2. `renderer.js` reads `localStorage` first; falls back to `.env` defaults if not set
3. User changes in panel → saved to `localStorage` on Apply

---

## Sound

- No audio files — generated entirely via Web Audio API
- 3-note ascending 8-bit chime (square wave oscillator)
- Triggered once when state transitions to `ended`
- Respects `SOUND_ENABLED` env var default (user can toggle in settings panel)

---

## IPC (preload.js)

Exposes a single `window.env` object to the renderer:

```js
{
  workMinutes: number,
  shortBreakMinutes: number,
  longBreakMinutes: number,
  autoTransition: boolean,
  alwaysOnTop: boolean,
  notificationsEnabled: boolean,
  soundEnabled: boolean
}
```

No other Node.js APIs exposed to renderer.

---

## Out of Scope

- Custom sound file support
- System tray integration
- Multiple timer profiles
- Statistics / session history
- Windows/Linux-specific transparency handling (macOS primary target)
