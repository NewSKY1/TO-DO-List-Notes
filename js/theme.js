// theme.js — theme + day/night mode + font size + ringtone selection & playback.
import { load, save, KEYS } from './storage.js';

export const THEMES = [
  { id: 'orbit', name: 'Orbit', colors: ['#0a0e1a', '#6366f1', '#22d3ee', '#e2e6f3'] },
  { id: 'ocean', name: 'Muted Ocean', colors: ['#161b26', '#7c93c4', '#5c9eab', '#d7dde6'] },
  { id: 'slate', name: 'Warm Slate', colors: ['#1c1a18', '#d9b382', '#c98a5c', '#ece6df'] },
  { id: 'lavender', name: 'Soft Lavender', colors: ['#1a1622', '#a68fd1', '#d9a5c0', '#e6e1ef'] },
  { id: 'forest', name: 'Forest Night', colors: ['#131a16', '#7fae8a', '#a3c9a8', '#dde6e0'] },
  { id: 'handwritten', name: 'Handwritten', colors: ['#ece3d2', '#b0492f', '#2f6f7a', '#3c3428'] },
  { id: 'alcove', name: 'Modern Alcove', colors: ['#ece4d3', '#b8703f', '#7a8f6a', '#3a2e22'] },
  { id: 'biophilic', name: 'Biophilic Forest', colors: ['#10190f', '#7bc47f', '#d8f28e', '#e4ecd8'] }
];

// Themes that are naturally light default to "day"; the rest default to "night".
const LIGHT_NATIVE = ['handwritten', 'alcove'];

export const RINGTONES = [
  { id: 'chime', name: 'Chime', freqs: [880, 1320] },
  { id: 'pulse', name: 'Pulse', freqs: [440, 440, 440] },
  { id: 'digital', name: 'Digital', freqs: [660, 990, 1320] },
  { id: 'bell', name: 'Soft Bell', freqs: [520, 780] }
];

export const FONT_SCALES = { small: 0.9, medium: 1, large: 1.15 };

export let currentTheme = load(KEYS.THEME, 'orbit');
export let currentMode = load(KEYS.MODE, LIGHT_NATIVE.includes(currentTheme) ? 'day' : 'night');
export let currentFontSize = load(KEYS.FONT_SIZE, 'medium');
export let currentRingtone = load(KEYS.RINGTONE, 'chime');

export function applyTheme(id) {
  currentTheme = id;
  document.documentElement.setAttribute('data-theme', id);
  save(KEYS.THEME, id);
}

export function applyMode(mode) {
  currentMode = mode;
  document.documentElement.setAttribute('data-mode', mode);
  save(KEYS.MODE, mode);
}

export function toggleMode() {
  applyMode(currentMode === 'night' ? 'day' : 'night');
  return currentMode;
}

export function applyFontSize(size) {
  currentFontSize = size;
  document.documentElement.style.setProperty('--font-scale', FONT_SCALES[size]);
  save(KEYS.FONT_SIZE, size);
}

export function setRingtone(id) {
  currentRingtone = id;
  save(KEYS.RINGTONE, id);
}

let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

export function playTone(id) {
  const tone = RINGTONES.find(t => t.id === id) || RINGTONES[0];
  try {
    const ctx = getAudioCtx();
    tone.freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = 'sine';
      const start = ctx.currentTime + i * 0.16;
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.2, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(start); osc.stop(start + 0.16);
    });
  } catch (e) { console.error('Tone playback failed', e); }
}