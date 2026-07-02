// storage.js — thin wrapper around localStorage with JSON + error handling.
export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error('Load failed for', key, e);
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Save failed for', key, e);
  }
}

export function uid() {
  return 'id' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : str;
  return div.innerHTML;
}

// Storage keys used across the app
export const KEYS = {
  TASKS: 'orbit_tasks_v3',
  NOTES: 'orbit_notes_v2',
  TRASH_TASKS: 'orbit_trash_tasks_v1',
  TRASH_NOTES: 'orbit_trash_notes_v1',
  THEME: 'orbit_theme_v2',
  MODE: 'orbit_mode_v1',
  FONT_SIZE: 'orbit_font_size',
  RINGTONE: 'orbit_ringtone',
  NOTIFY: 'orbit_notify_enabled'
};

export const TRASH_RETENTION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days