// trash.js — soft-delete storage for tasks & notes. Generic: doesn't know
// what a "task" or "note" is, just holds items tagged with a kind + timestamp.
import { load, save, KEYS, TRASH_RETENTION_MS } from './storage.js';

export let trashedTasks = load(KEYS.TRASH_TASKS, []);
export let trashedNotes = load(KEYS.TRASH_NOTES, []);

function saveTrashTasks() { save(KEYS.TRASH_TASKS, trashedTasks); }
function saveTrashNotes() { save(KEYS.TRASH_NOTES, trashedNotes); }

export function moveToTrash(kind, item) {
  const entry = { ...item, deletedAt: Date.now() };
  if (kind === 'task') { trashedTasks.push(entry); saveTrashTasks(); }
  else { trashedNotes.push(entry); saveTrashNotes(); }
}

// Removes the item from trash and returns it (deletedAt stripped), or null.
export function restoreFromTrash(kind, id) {
  const list = kind === 'task' ? trashedTasks : trashedNotes;
  const idx = list.findIndex(i => i.id === id);
  if (idx === -1) return null;
  const [item] = list.splice(idx, 1);
  delete item.deletedAt;
  if (kind === 'task') saveTrashTasks(); else saveTrashNotes();
  return item;
}

export function permanentlyDelete(kind, id) {
  if (kind === 'task') { trashedTasks = trashedTasks.filter(i => i.id !== id); saveTrashTasks(); }
  else { trashedNotes = trashedNotes.filter(i => i.id !== id); saveTrashNotes(); }
}

export function purgeTrash() {
  const now = Date.now();
  const beforeT = trashedTasks.length, beforeN = trashedNotes.length;
  trashedTasks = trashedTasks.filter(t => now - t.deletedAt < TRASH_RETENTION_MS);
  trashedNotes = trashedNotes.filter(n => now - n.deletedAt < TRASH_RETENTION_MS);
  if (trashedTasks.length !== beforeT) saveTrashTasks();
  if (trashedNotes.length !== beforeN) saveTrashNotes();
}

export function getTrashSnapshot() {
  return [
    ...trashedTasks.map(t => ({ kind: 'task', id: t.id, label: t.text, deletedAt: t.deletedAt })),
    ...trashedNotes.map(n => ({ kind: 'note', id: n.id, label: n.title || 'Untitled note', deletedAt: n.deletedAt }))
  ].sort((a, b) => b.deletedAt - a.deletedAt);
}