// main.js — entry point. Wires up every event listener and boots the app.
import * as dom from './dom.js';
import { ui } from './ui-state.js';
import {
  tasks, notes, taskTextExists, addTask, toggleTask, editTaskText, deleteTask,
  clearCompletedTasks, deleteAllTasks, restoreTaskFromTrashItem, reorderTasks,
  addNote, editNote, deleteNote, restoreNoteFromTrashItem
} from './state.js';
import {
  render, renderTasks, renderNotes, renderThemeGrid, renderRingtones, renderTrash,
  renderCountdownsOnly, showToast, popLeaf
} from './render.js';
import {
  THEMES, RINGTONES, currentTheme, currentMode, currentFontSize, currentRingtone,
  applyTheme, applyMode, toggleMode, applyFontSize, setRingtone, playTone
} from './theme.js';
import { purgeTrash, restoreFromTrash, permanentlyDelete } from './trash.js';
import { notifyEnabled, toggleNotify, checkReminders } from './reminders.js';

/* ---------------- Init theme/mode/font ---------------- */
applyTheme(currentTheme);
applyMode(currentMode);
applyFontSize(currentFontSize);
renderThemeGrid();
renderRingtones();
updateModeIcon();
updateNotifButtons();

/* ---------------- Day / Night ---------------- */
function updateModeIcon() {
  dom.modeIcon.innerHTML = currentMode === 'night'
    ? '<circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.7"/><path d="M12 2V4.5M12 19.5V22M4.2 4.2L6 6M18 18L19.8 19.8M2 12H4.5M19.5 12H22M4.2 19.8L6 18M18 6L19.8 4.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'
    : '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4A8.5 8.5 0 1 0 20 14.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>';
}
dom.modeBtn.addEventListener('click', () => { toggleMode(); updateModeIcon(); });

/* ---------------- Reminders toggle (header + settings) ---------------- */
function updateNotifButtons() {
  [dom.notifBtn, dom.notifBtnSettings].forEach(btn => {
    btn.classList.toggle('on', notifyEnabled);
    btn.title = notifyEnabled ? 'Reminders on' : 'Reminders off';
  });
}
dom.notifBtn.addEventListener('click', async () => { await toggleNotify(); updateNotifButtons(); });
dom.notifBtnSettings.addEventListener('click', async () => { await toggleNotify(); updateNotifButtons(); });

/* ---------------- Settings overlay + collapsible rows ---------------- */
dom.settingsBtn.addEventListener('click', () => dom.settingsOverlay.classList.add('open'));
dom.closeSettingsBtn.addEventListener('click', () => dom.settingsOverlay.classList.remove('open'));

function closeAllDropdowns() {
  dom.fontSizeDropdown.classList.remove('open');
  dom.themeDropdown.classList.remove('open');
  dom.ringtoneDropdown.classList.remove('open');
}
dom.fontSizeRowBtn.addEventListener('click', () => {
  const willOpen = !dom.fontSizeDropdown.classList.contains('open');
  closeAllDropdowns();
  dom.fontSizeDropdown.classList.toggle('open', willOpen);
});
dom.themeRowBtn.addEventListener('click', () => {
  const willOpen = !dom.themeDropdown.classList.contains('open');
  closeAllDropdowns();
  dom.themeDropdown.classList.toggle('open', willOpen);
});
dom.ringtoneRowBtn.addEventListener('click', () => {
  const willOpen = !dom.ringtoneDropdown.classList.contains('open');
  closeAllDropdowns();
  dom.ringtoneDropdown.classList.toggle('open', willOpen);
});

dom.fontSizeRow.addEventListener('click', (e) => {
  const btn = e.target.closest('button'); if (!btn) return;
  applyFontSize(btn.dataset.size);
  [...dom.fontSizeRow.children].forEach(b => b.classList.toggle('active', b === btn));
  dom.fontSizeValue.textContent = `${btn.textContent} ⌄`;
});

dom.themeGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.theme-card'); if (!btn) return;
  applyTheme(btn.dataset.themeId);
  renderThemeGrid();
  showToast(`Theme set to ${THEMES.find(t => t.id === btn.dataset.themeId).name}`);
});

dom.ringtoneList.addEventListener('click', (e) => {
  const li = e.target.closest('li'); if (!li) return;
  if (e.target.closest('.preview-btn')) { playTone(li.dataset.toneId); return; }
  setRingtone(li.dataset.toneId);
  renderRingtones();
});

/* ---------------- Recently Deleted subpage + action sheet ---------------- */
dom.trashRowBtn.addEventListener('click', () => {
  renderTrash();
  dom.trashOverlay.classList.add('open');
});
dom.closeTrashBtn.addEventListener('click', () => dom.trashOverlay.classList.remove('open'));

let pendingTrashItem = null;
dom.trashList.addEventListener('click', (e) => {
  const li = e.target.closest('li'); if (!li) return;
  pendingTrashItem = { kind: li.dataset.kind, id: li.dataset.id, label: li.querySelector('.trash-text').textContent };
  dom.trashActionTitle.textContent = pendingTrashItem.label;
  dom.trashActionSheet.classList.add('open');
  dom.backdrop.classList.add('visible');
});
dom.trashRestoreBtn.addEventListener('click', () => {
  if (!pendingTrashItem) return;
  const item = restoreFromTrash(pendingTrashItem.kind, pendingTrashItem.id);
  if (item) {
    if (pendingTrashItem.kind === 'task') restoreTaskFromTrashItem(item);
    else restoreNoteFromTrashItem(item);
    render(); renderTrash();
    showToast('Restored.');
  }
  closeTrashActionSheet();
});
dom.trashDeleteForeverBtn.addEventListener('click', () => {
  if (!pendingTrashItem) return;
  permanentlyDelete(pendingTrashItem.kind, pendingTrashItem.id);
  renderTrash();
  closeTrashActionSheet();
});
function closeTrashActionSheet() {
  dom.trashActionSheet.classList.remove('open');
  dom.backdrop.classList.remove('visible');
  pendingTrashItem = null;
}

/* ---------------- Top tabs ---------------- */
dom.navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    ui.activeTab = btn.dataset.tab;
    dom.navBtns.forEach(b => b.classList.toggle('active', b === btn));
    dom.tasksPanel.classList.toggle('hidden', ui.activeTab !== 'tasks');
    dom.notesPanel.classList.toggle('hidden', ui.activeTab !== 'notes');
    dom.searchInput.placeholder = ui.activeTab === 'tasks' ? 'Search tasks…' : 'Search notes…';
    dom.searchInput.value = ''; ui.searchTerm = '';
    dom.fabBtn.setAttribute('aria-label', ui.activeTab === 'tasks' ? 'Add task' : 'Add note');
    dom.sortToggleBtn.style.display = ui.activeTab === 'tasks' ? 'flex' : 'none';
    closeMoreMenu(); closePopovers();
    render();
  });
});

dom.searchInput.addEventListener('input', (e) => { ui.searchTerm = e.target.value; render(); });

/* ---------------- Filter / sort popovers ---------------- */
function closePopovers() {
  dom.filterPopover.classList.remove('open');
  dom.sortPopover.classList.remove('open');
  dom.noteFilterPopover.classList.remove('open');
}
dom.filterToggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  dom.sortPopover.classList.remove('open');
  if (ui.activeTab === 'tasks') dom.filterPopover.classList.toggle('open');
  else { dom.filterPopover.classList.remove('open'); dom.noteFilterPopover.classList.toggle('open'); }
});
dom.sortToggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  dom.filterPopover.classList.remove('open'); dom.noteFilterPopover.classList.remove('open');
  dom.sortPopover.classList.toggle('open');
});
document.addEventListener('click', (e) => {
  if (!dom.filterPopover.contains(e.target) && !dom.sortPopover.contains(e.target) && !dom.noteFilterPopover.contains(e.target)
    && e.target !== dom.filterToggleBtn && e.target !== dom.sortToggleBtn) closePopovers();
});

dom.filterRow.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn'); if (!btn) return;
  ui.taskFilter = btn.dataset.filter;
  [...dom.filterRow.children].forEach(b => b.classList.toggle('active', b === btn));
  renderTasks();
});
dom.categoryRow.addEventListener('click', (e) => {
  const btn = e.target.closest('.chip'); if (!btn) return;
  ui.taskCategory = btn.dataset.category;
  [...dom.categoryRow.children].forEach(b => b.classList.toggle('active', b === btn));
  renderTasks();
});
dom.noteCategoryRow.addEventListener('click', (e) => {
  const btn = e.target.closest('.chip'); if (!btn) return;
  ui.noteCategory = btn.dataset.category;
  [...dom.noteCategoryRow.children].forEach(b => b.classList.toggle('active', b === btn));
  renderNotes();
});
dom.sortPopover.addEventListener('click', (e) => {
  const btn = e.target.closest('.sort-option'); if (!btn) return;
  ui.sortMode = btn.dataset.sort;
  [...dom.sortPopover.children].forEach(b => b.classList.toggle('active', b === btn));
  renderTasks(); setupSortable(); closePopovers();
});

/* ---------------- More menu ---------------- */
function closeMoreMenu() { dom.moreMenu.classList.remove('open'); }
dom.moreBtn.addEventListener('click', (e) => { e.stopPropagation(); dom.moreMenu.classList.toggle('open'); });
document.addEventListener('click', (e) => { if (!dom.moreMenu.contains(e.target) && e.target !== dom.moreBtn) closeMoreMenu(); });

dom.clearCompletedBtn.addEventListener('click', () => {
  const count = clearCompletedTasks();
  if (count === 0) { showToast('Nothing to clear.'); closeMoreMenu(); return; }
  render(); closeMoreMenu();
  showToast('Completed tasks moved to Recently Deleted.');
});
dom.deleteAllBtn.addEventListener('click', () => {
  if (tasks.length === 0) { closeMoreMenu(); return; }
  if (!confirm('Delete all tasks? They will be moved to Recently Deleted for 30 days.')) { closeMoreMenu(); return; }
  deleteAllTasks(); render(); closeMoreMenu();
});
dom.exportCsvBtn.addEventListener('click', () => {
  if (tasks.length === 0) { showToast('No tasks to export.'); closeMoreMenu(); return; }
  const rows = [['Task', 'Status', 'Priority', 'Category', 'Due Date']];
  tasks.forEach(t => rows.push([t.text, t.completed ? 'Completed' : 'Pending', t.priority, t.category, t.dueDate || '']));
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'orbit-tasks.csv');
  closeMoreMenu();
});
dom.exportPdfBtn.addEventListener('click', () => {
  if (tasks.length === 0) { showToast('No tasks to export.'); closeMoreMenu(); return; }
  if (!window.jspdf) { showToast('PDF library failed to load.'); closeMoreMenu(); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(16); doc.text('Orbit — Tasks', 14, 18);
  doc.setFontSize(10); doc.setTextColor(120); doc.text(new Date().toLocaleDateString(), 14, 24);
  let y = 34; doc.setTextColor(20);
  tasks.forEach(t => {
    if (y > 280) { doc.addPage(); y = 20; }
    doc.setFontSize(11); doc.text(`${t.completed ? '[x]' : '[ ]'} ${t.text}`, 14, y);
    doc.setFontSize(8.5); doc.setTextColor(140);
    doc.text(`${t.priority} · ${t.category}${t.dueDate ? ' · due ' + t.dueDate : ''}`, 20, y + 5);
    doc.setTextColor(20); y += 12;
  });
  doc.save('orbit-tasks.pdf'); closeMoreMenu();
});
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ---------------- FAB + Composers ---------------- */
function openComposer() {
  const composer = ui.activeTab === 'tasks' ? dom.taskComposer : dom.noteComposer;
  composer.classList.add('open'); dom.backdrop.classList.add('visible'); dom.fabBtn.classList.add('open');
  setTimeout(() => (ui.activeTab === 'tasks' ? dom.taskInput : dom.noteTitleInput).focus(), 150);
}
function closeComposers() {
  dom.taskComposer.classList.remove('open'); dom.noteComposer.classList.remove('open');
  dom.backdrop.classList.remove('visible'); dom.fabBtn.classList.remove('open');
}
dom.fabBtn.addEventListener('click', () => {
  const isOpen = dom.taskComposer.classList.contains('open') || dom.noteComposer.classList.contains('open');
  if (isOpen) closeComposers(); else openComposer();
});
dom.backdrop.addEventListener('click', () => {
  closeComposers();
  dom.settingsOverlay.classList.remove('open');
  dom.trashOverlay.classList.remove('open');
  closeTrashActionSheet();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeComposers(); closePopovers(); closeAllDropdowns();
    dom.settingsOverlay.classList.remove('open');
    dom.trashOverlay.classList.remove('open');
    closeTrashActionSheet();
  }
});

dom.priorityRow.addEventListener('click', (e) => {
  const btn = e.target.closest('.chip'); if (!btn) return;
  ui.composerPriority = btn.dataset.priority;
  [...dom.priorityRow.children].forEach(b => b.classList.toggle('active', b === btn));
});
dom.taskCategoryPicker.addEventListener('click', (e) => {
  const btn = e.target.closest('.chip'); if (!btn) return;
  ui.composerTaskCategory = btn.dataset.category;
  [...dom.taskCategoryPicker.children].forEach(b => b.classList.toggle('active', b === btn));
});
dom.noteCategoryPicker.addEventListener('click', (e) => {
  const btn = e.target.closest('.chip'); if (!btn) return;
  ui.composerNoteCategory = btn.dataset.category;
  [...dom.noteCategoryPicker.children].forEach(b => b.classList.toggle('active', b === btn));
});

/* ---------------- Task form ---------------- */
function showTaskError(msg) {
  dom.taskError.textContent = msg;
  if (msg) { clearTimeout(showTaskError._t); showTaskError._t = setTimeout(() => dom.taskError.textContent = '', 2500); }
}
dom.taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = dom.taskInput.value.trim();
  if (!text) { showTaskError("Task can't be empty."); return; }
  if (taskTextExists(text)) { showTaskError('That task already exists.'); return; }
  addTask({
    text,
    priority: ui.composerPriority,
    category: ui.composerTaskCategory,
    dueDate: dom.dueDateInput.value,
    dueTime: dom.dueTimeInput.value
  });
  dom.taskInput.value = ''; dom.dueDateInput.value = ''; dom.dueTimeInput.value = '';
  render(); showToast('Task added to your orbit.'); popLeaf(dom.fabBtn);
});

/* ---------------- Note form ---------------- */
function showNoteError(msg) {
  dom.noteError.textContent = msg;
  if (msg) { clearTimeout(showNoteError._t); showNoteError._t = setTimeout(() => dom.noteError.textContent = '', 2500); }
}
dom.noteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = dom.noteTitleInput.value.trim();
  const text = dom.noteTextInput.value.trim();
  if (!title && !text) { showNoteError('Write something before saving.'); return; }
  addNote({ title, text, category: ui.composerNoteCategory });
  dom.noteTitleInput.value = ''; dom.noteTextInput.value = '';
  render(); showToast('Note saved.');
});
dom.noteTitleInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); dom.noteTextInput.focus(); } });

/* ---------------- Task list events ---------------- */
dom.taskList.addEventListener('click', (e) => {
  const item = e.target.closest('.task-item'); if (!item) return;
  const id = item.dataset.id;
  if (e.target.closest('.task-check')) {
    const t = toggleTask(id); render(); if (t && t.completed) popLeaf(dom.taskList);
  } else if (e.target.closest('.delete')) {
    item.classList.add('removing');
    item.addEventListener('animationend', () => { deleteTask(id); render(); }, { once: true });
  } else if (e.target.closest('.edit')) {
    const textEl = item.querySelector('.task-text');
    textEl.contentEditable = 'true'; textEl.focus(); document.execCommand('selectAll', false, null);
  }
});
dom.taskList.addEventListener('blur', (e) => {
  if (e.target.classList && e.target.classList.contains('task-text') && e.target.contentEditable === 'true') {
    const item = e.target.closest('.task-item');
    e.target.contentEditable = 'false';
    editTaskText(item.dataset.id, e.target.textContent);
    render();
  }
}, true);
dom.taskList.addEventListener('keydown', (e) => {
  if (e.target.classList && e.target.classList.contains('task-text') && e.target.contentEditable === 'true') {
    if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); }
    else if (e.key === 'Escape') { e.preventDefault(); renderTasks(); }
  }
});

/* ---------------- Note list events ---------------- */
dom.noteList.addEventListener('click', (e) => {
  const item = e.target.closest('.note-item'); if (!item) return;
  const id = item.dataset.id;
  if (e.target.closest('.delete')) {
    item.classList.add('removing');
    item.addEventListener('animationend', () => { deleteNote(id); render(); }, { once: true });
  } else if (e.target.closest('.edit')) {
    const titleEl = item.querySelector('.note-title'); const textEl = item.querySelector('.note-text');
    titleEl.contentEditable = 'true'; textEl.contentEditable = 'true'; titleEl.focus();
  }
});
dom.noteList.addEventListener('blur', (e) => {
  const target = e.target; if (!target.classList) return;
  const isTitle = target.classList.contains('note-title'); const isText = target.classList.contains('note-text');
  if ((isTitle || isText) && target.contentEditable === 'true') {
    const item = target.closest('.note-item');
    const titleEl = item.querySelector('.note-title'); const textEl = item.querySelector('.note-text');
    setTimeout(() => {
      if (document.activeElement !== titleEl && document.activeElement !== textEl) {
        titleEl.contentEditable = 'false'; textEl.contentEditable = 'false';
        editNote(item.dataset.id, titleEl.textContent, textEl.textContent);
        render();
      }
    }, 80);
  }
}, true);

/* ---------------- Drag reorder ---------------- */
let sortableInstance = null;
function setupSortable() {
  if (sortableInstance) { sortableInstance.destroy(); sortableInstance = null; }
  if (typeof Sortable === 'undefined') return;
  const manual = ui.sortMode === 'manual';
  sortableInstance = Sortable.create(dom.taskList, {
    handle: '.drag-handle', animation: 150, disabled: !manual,
    onEnd: () => reorderTasks([...dom.taskList.querySelectorAll('.task-item')].map(li => li.dataset.id))
  });
}

/* ---------------- Boot ---------------- */
purgeTrash();
render();
setupSortable();
checkReminders();
setInterval(checkReminders, 60 * 1000);
setInterval(renderCountdownsOnly, 30 * 1000);
setInterval(purgeTrash, 60 * 60 * 1000);