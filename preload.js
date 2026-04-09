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
