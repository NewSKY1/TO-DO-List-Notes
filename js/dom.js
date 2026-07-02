// dom.js — grabs every element the app needs, once, and exports references.
const el = (id) => document.getElementById(id);

export const modeBtn = el('modeBtn');
export const modeIcon = el('modeIcon');
export const notifBtn = el('notifBtn');
export const notifBtnSettings = el('notifBtnSettings');
export const settingsBtn = el('settingsBtn');
export const settingsOverlay = el('settingsOverlay');
export const closeSettingsBtn = el('closeSettingsBtn');

export const navBtns = document.querySelectorAll('.nav-btn');
export const tasksPanel = el('tasksPanel');
export const notesPanel = el('notesPanel');
export const searchInput = el('searchInput');

export const filterToggleBtn = el('filterToggleBtn');
export const sortToggleBtn = el('sortToggleBtn');
export const filterPopover = el('filterPopover');
export const sortPopover = el('sortPopover');
export const noteFilterPopover = el('noteFilterPopover');
export const filterRow = el('filterRow');
export const categoryRow = el('categoryRow');
export const noteCategoryRow = el('noteCategoryRow');

export const taskList = el('taskList');
export const tasksEmpty = el('tasksEmpty');
export const tasksEmptyText = el('tasksEmptyText');
export const countLabel = el('countLabel');
export const ringProgress = el('ringProgress');
export const ringLabel = el('ringLabel');
export const statusLine = el('statusLine');

export const moreBtn = el('moreBtn');
export const moreMenu = el('moreMenu');
export const clearCompletedBtn = el('clearCompletedBtn');
export const deleteAllBtn = el('deleteAllBtn');
export const exportCsvBtn = el('exportCsvBtn');
export const exportPdfBtn = el('exportPdfBtn');

export const noteList = el('noteList');
export const notesEmpty = el('notesEmpty');
export const notesEmptyText = el('notesEmptyText');
export const noteCountLabel = el('noteCountLabel');

export const fabBtn = el('fabBtn');
export const backdrop = el('backdrop');
export const taskComposer = el('taskComposer');
export const noteComposer = el('noteComposer');

export const taskForm = el('taskForm');
export const taskInput = el('taskInput');
export const taskError = el('taskError');
export const priorityRow = el('priorityRow');
export const taskCategoryPicker = el('taskCategoryPicker');
export const dueDateInput = el('dueDateInput');
export const dueTimeInput = el('dueTimeInput');

export const noteForm = el('noteForm');
export const noteTitleInput = el('noteTitleInput');
export const noteTextInput = el('noteTextInput');
export const noteError = el('noteError');
export const noteCategoryPicker = el('noteCategoryPicker');

export const toast = el('toast');
export const leafPop = el('leafPop');

export const trashRowBtn = el('trashRowBtn');
export const trashOverlay = el('trashOverlay');
export const closeTrashBtn = el('closeTrashBtn');
export const trashList = el('trashList');
export const trashEmpty = el('trashEmpty');
export const trashActionSheet = el('trashActionSheet');
export const trashActionTitle = el('trashActionTitle');
export const trashRestoreBtn = el('trashRestoreBtn');
export const trashDeleteForeverBtn = el('trashDeleteForeverBtn');

export const fontSizeRowBtn = el('fontSizeRowBtn');
export const fontSizeValue = el('fontSizeValue');
export const fontSizeDropdown = el('fontSizeDropdown');
export const fontSizeRow = el('fontSizeRow');

export const themeRowBtn = el('themeRowBtn');
export const themeValue = el('themeValue');
export const themeDropdown = el('themeDropdown');
export const themeGrid = el('themeGrid');

export const ringtoneRowBtn = el('ringtoneRowBtn');
export const ringtoneValue = el('ringtoneValue');
export const ringtoneDropdown = el('ringtoneDropdown');
export const ringtoneList = el('ringtoneList');