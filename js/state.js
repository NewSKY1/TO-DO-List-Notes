// state.js — owns the live tasks & notes arrays and all CRUD operations.
import { load, save, uid, KEYS } from './storage.js';
import { moveToTrash } from './trash.js';

export let tasks = load(KEYS.TASKS, []);
export let notes = load(KEYS.NOTES, []);

export const saveTasks = () => save(KEYS.TASKS, tasks);
export const saveNotes = () => save(KEYS.NOTES, notes);

/* ---------------- Tasks ---------------- */
export function taskTextExists(text) {
  return tasks.some(t => t.text.toLowerCase() === text.toLowerCase());
}

export function addTask({ text, priority, category, dueDate, dueTime }) {
  const maxOrder = tasks.reduce((m, t) => Math.max(m, t.order || 0), 0);
  const dueAt = dueDate
    ? new Date(`${dueDate}T${dueTime || '23:59'}`).getTime()
    : null;
  tasks.unshift({
    id: uid(), text, completed: false, priority, category,
    dueDate: dueDate || null, dueTime: dueTime || null, dueAt,
    createdAt: Date.now(), order: maxOrder + 1, notifiedAt: null
  });
  saveTasks();
}

export function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (t) { t.completed = !t.completed; saveTasks(); }
  return t;
}

export function editTaskText(id, newText) {
  const trimmed = newText.trim();
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  if (!trimmed) { deleteTask(id); return; }
  t.text = trimmed; saveTasks();
}

export function deleteTask(id) {
  const t = tasks.find(t => t.id === id);
  if (t) moveToTrash('task', t);
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
}

export function clearCompletedTasks() {
  const done = tasks.filter(t => t.completed);
  done.forEach(t => moveToTrash('task', t));
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  return done.length;
}

export function deleteAllTasks() {
  tasks.forEach(t => moveToTrash('task', t));
  tasks = [];
  saveTasks();
}

export function restoreTaskFromTrashItem(item) {
  tasks.unshift(item);
  saveTasks();
}

export function reorderTasks(idsInOrder) {
  idsInOrder.forEach((id, index) => {
    const t = tasks.find(t => t.id === id);
    if (t) t.order = index;
  });
  saveTasks();
}

/* ---------------- Notes ---------------- */
export function addNote({ title, text, category }) {
  const maxOrder = notes.reduce((m, n) => Math.max(m, n.order || 0), 0);
  notes.unshift({ id: uid(), title: title || 'Untitled', text, category, createdAt: Date.now(), order: maxOrder + 1 });
  saveNotes();
}

export function editNote(id, title, text) {
  const n = notes.find(n => n.id === id);
  if (!n) return;
  n.title = title.trim() || 'Untitled';
  n.text = text.trim();
  saveNotes();
}

export function deleteNote(id) {
  const n = notes.find(n => n.id === id);
  if (n) moveToTrash('note', n);
  notes = notes.filter(n => n.id !== id);
  saveNotes();
}

export function restoreNoteFromTrashItem(item) {
  notes.unshift(item);
  saveNotes();
}