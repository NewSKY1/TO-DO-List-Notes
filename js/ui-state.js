// ui-state.js — ephemeral view state (not persisted): current tab, active
// filters/search/sort, and the composer's currently-selected picker values.
export const ui = {
  activeTab: 'tasks',
  taskFilter: 'all',
  taskCategory: 'all',
  noteCategory: 'all',
  sortMode: 'newest',
  searchTerm: '',
  composerPriority: 'medium',
  composerTaskCategory: 'none',
  composerNoteCategory: 'none'
};