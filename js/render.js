// render.js — every function that builds or updates the DOM, plus small UI
// feedback helpers (toast, leaf micro-interaction).
import { escapeHtml } from './storage.js';
import { tasks, notes } from './state.js';
import { ui } from './ui-state.js';
import { THEMES, RINGTONES, currentTheme, currentRingtone } from './theme.js';
import { getTrashSnapshot } from './trash.js';
import * as dom from './dom.js';

const RING_CIRCUMFERENCE = 327;
const PRIORITY_RANK = { high: 3, medium: 2, low: 1 };

/* ---------------- Toast + micro-interaction ---------------- */
export function showToast(msg, ms = 3200) {
  dom.toast.textContent = msg;
  dom.toast.classList.add('visible');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => dom.toast.classList.remove('visible'), ms);
}

export function popLeaf(nearEl) {
  if (currentTheme !== 'biophilic') return;
  const rect = (nearEl || dom.fabBtn).getBoundingClientRect();
  dom.leafPop.style.left = (rect.left + rect.width / 2 - 10) + 'px';
  dom.leafPop.style.top = (rect.top - 10) + 'px';
  dom.leafPop.classList.remove('pop'); void dom.leafPop.offsetWidth;
  dom.leafPop.classList.add('pop');
}

/* ---------------- Helpers ---------------- */
function categoryLabel(cat) {
  if (!cat || cat === 'none') return null;
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

export function dueBadgeInfo(dueDate, dueTime, dueAt, completed) {
  if (!dueDate) return null;
  const due = new Date(dueAt || `${dueDate}T${dueTime || '23:59:59'}`);
  const now = new Date();
  const diffMs = due - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const dateLabel = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const timeLabel = dueTime ? due.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
  const fullLabel = timeLabel ? `${dateLabel} · ${timeLabel}` : dateLabel;
  if (completed) return { text: `Due ${fullLabel}`, cls: '' };
  if (diffMs < 0) return { text: `Overdue · ${fullLabel}`, cls: 'overdue' };
  if (diffMs <= 24 * 60 * 60 * 1000) return { text: `Due in ${Math.max(1, Math.round(diffMs / 3600000))}h`, cls: 'soon' };
  return { text: `Due ${fullLabel} · ${diffDays}d left`, cls: '' };
}

export function getVisibleTasks() {
  let list = tasks.filter(t => {
    const matchesFilter = ui.taskFilter === 'all' ? true : ui.taskFilter === 'active' ? !t.completed : t.completed;
    const matchesCategory = ui.taskCategory === 'all' ? true : t.category === ui.taskCategory;
    const matchesSearch = t.text.toLowerCase().includes(ui.searchTerm.toLowerCase());
    return matchesFilter && matchesCategory && matchesSearch;
  });
  if (ui.sortMode === 'newest') list = list.slice().sort((a, b) => b.createdAt - a.createdAt);
  else if (ui.sortMode === 'priority') list = list.slice().sort((a, b) => (PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]) || (b.createdAt - a.createdAt));
  else if (ui.sortMode === 'due') list = list.slice().sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return b.createdAt - a.createdAt;
    if (!a.dueDate) return 1; if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
  else list = list.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  return list;
}

export function getVisibleNotes() {
  return notes.filter(n => {
    const matchesCategory = ui.noteCategory === 'all' ? true : n.category === ui.noteCategory;
    const haystack = (n.title + ' ' + n.text).toLowerCase();
    return matchesCategory && haystack.includes(ui.searchTerm.toLowerCase());
  }).sort((a, b) => (a.order || 0) - (b.order || 0)).reverse();
}

/* ---------------- Tasks ---------------- */
export function renderTasks() {
  const visible = getVisibleTasks();
  const manual = ui.sortMode === 'manual';

  dom.taskList.innerHTML = visible.map(task => {
    const due = dueBadgeInfo(task.dueDate, task.dueTime, task.dueAt, task.completed);
    const catLabel = categoryLabel(task.category);
    return `
    <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
      <span class="drag-handle ${manual ? '' : 'disabled'}" title="Drag to reorder">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="8" cy="6" r="1.5" fill="currentColor"/><circle cx="8" cy="12" r="1.5" fill="currentColor"/><circle cx="8" cy="18" r="1.5" fill="currentColor"/><circle cx="16" cy="6" r="1.5" fill="currentColor"/><circle cx="16" cy="12" r="1.5" fill="currentColor"/><circle cx="16" cy="18" r="1.5" fill="currentColor"/></svg>
      </span>
      <button class="task-check" aria-label="Toggle complete">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 13L9.5 17.5L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="task-body">
        <span class="task-text" contenteditable="false" spellcheck="false">${escapeHtml(task.text)}</span>
        <div class="task-meta">
          <span class="badge priority-${task.priority}">${task.priority}</span>
          ${catLabel ? `<span class="badge category">${catLabel}</span>` : ''}
          ${due ? `<span class="badge due ${due.cls}" data-due-badge>${due.text}</span>` : ''}
        </div>
      </div>
      <div class="task-actions">
        <button class="icon-btn edit" aria-label="Edit task">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M16.5 3.5L20.5 7.5L8 20H4V16L16.5 3.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
        </button>
        <button class="icon-btn delete" aria-label="Delete task">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 7H20M9 7V4H15V7M6 7L7 20H17L18 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </li>`;
  }).join('');

  const noneAtAll = tasks.length === 0;
  dom.tasksEmpty.classList.toggle('visible', visible.length === 0);
  dom.tasksEmptyText.textContent = noneAtAll ? 'Your orbit is empty. Tap + to add your first task.' : 'No tasks match your filters.';

  const total = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const pending = total - completedCount;
  dom.countLabel.textContent = `${total} task${total !== 1 ? 's' : ''} · ${pending} pending`;
  dom.statusLine.textContent = total === 0 ? 'No tasks in orbit yet' : pending === 0 ? 'All tasks complete 🎉' : `${pending} task${pending !== 1 ? 's' : ''} left to complete`;

  const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100);
  dom.ringProgress.style.strokeDashoffset = RING_CIRCUMFERENCE - (pct / 100) * RING_CIRCUMFERENCE;
  dom.ringLabel.textContent = `${pct}%`;
}

export function renderCountdownsOnly() {
  if (ui.activeTab !== 'tasks') return;
  document.querySelectorAll('#taskList .task-item').forEach(item => {
    const task = tasks.find(t => t.id === item.dataset.id);
    if (!task) return;
    const badge = item.querySelector('[data-due-badge]');
    const due = dueBadgeInfo(task.dueDate, task.dueTime, task.dueAt, task.completed);
    if (badge && due) { badge.textContent = due.text; badge.className = `badge due ${due.cls}`; }
  });
}

/* ---------------- Notes ---------------- */
export function renderNotes() {
  const visible = getVisibleNotes();
  dom.noteList.innerHTML = visible.map(note => {
    const catLabel = categoryLabel(note.category);
    return `
    <li class="note-item" data-id="${note.id}">
      <div class="note-item-head">
        <h3 class="note-title" contenteditable="false" spellcheck="false">${escapeHtml(note.title)}</h3>
        <div class="task-actions">
          <button class="icon-btn edit" aria-label="Edit note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M16.5 3.5L20.5 7.5L8 20H4V16L16.5 3.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
          </button>
          <button class="icon-btn delete" aria-label="Delete note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 7H20M9 7V4H15V7M6 7L7 20H17L18 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
      <p class="note-text" contenteditable="false" spellcheck="false">${escapeHtml(note.text)}</p>
      ${catLabel ? `<div class="note-meta"><span class="badge category">${catLabel}</span></div>` : ''}
    </li>`;
  }).join('');

  const noneAtAll = notes.length === 0;
  dom.notesEmpty.classList.toggle('visible', visible.length === 0);
  dom.notesEmptyText.textContent = noneAtAll ? 'No notes yet. Tap + to jot one down.' : 'No notes match your filters.';
  dom.noteCountLabel.textContent = `${notes.length} note${notes.length !== 1 ? 's' : ''}`;
}

export function render() { renderTasks(); renderNotes(); }

/* ---------------- Settings: theme grid / ringtones / trash ---------------- */
export function renderThemeGrid() {
  dom.themeGrid.innerHTML = THEMES.map(t => `
    <button class="theme-card ${t.id === currentTheme ? 'active' : ''}" data-theme-id="${t.id}">
      <div class="swatch-strip">${t.colors.map(c => `<span style="background:${c}"></span>`).join('')}</div>
      <div class="theme-name">${t.name}</div>
    </button>
  `).join('');
  dom.themeValue.textContent = `${THEMES.find(t => t.id === currentTheme).name} ⌄`;
}

export function renderRingtones() {
  dom.ringtoneList.innerHTML = RINGTONES.map(t => `
    <li class="${t.id === currentRingtone ? 'active' : ''}" data-tone-id="${t.id}">
      <input type="radio" name="ringtone" class="select-radio" ${t.id === currentRingtone ? 'checked' : ''}>
      <span class="tone-name">${t.name}</span>
      <button class="preview-btn" type="button" aria-label="Preview">▶</button>
    </li>
  `).join('');
  dom.ringtoneValue.textContent = `${RINGTONES.find(t => t.id === currentRingtone).name} ⌄`;
}

export function renderTrash() {
  const combined = getTrashSnapshot();
  dom.trashList.innerHTML = combined.map(item => `
    <li data-kind="${item.kind}" data-id="${item.id}">
      <span class="trash-text">${escapeHtml(item.label)}</span>
      <span class="trash-date">${new Date(item.deletedAt).toLocaleDateString()}</span>
    </li>
  `).join('');
  dom.trashEmpty.style.display = combined.length === 0 ? 'block' : 'none';
}