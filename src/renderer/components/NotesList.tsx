import React, { useState } from 'react';
import { Note, SortMode, ViewMode } from '../types';
import { PlusIcon, TrashIcon, SearchIcon, NoteIcon, SunIcon, MoonIcon } from './Icons';
import KanbanView from './KanbanView';
import { useLang } from '../LangContext';

interface Props {
  notes: Note[];
  onSelect: (note: Note) => void;
  onNew: () => void;
  onDelete: (noteId: string) => void;
  onPin: (noteId: string) => void;
  onRestore: (noteId: string) => void;
  onPermanentDelete: (noteId: string) => void;
  onExport: (noteId: string, format: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onShowShortcuts: () => void;
  onShowSettings: () => void;
  onShowStats: () => void;
  onShowCommandPalette: () => void;
  onKanbanStatusChange: (noteId: string, status: 'todo' | 'inprogress' | 'done') => void;
  onShowPomodoro: () => void;
  onExportZip: (noteIds: string[]) => void;
  pomodoroRunning: boolean;
  onShowOnboarding: () => void;
}

const colorMap = [
  { key: 'red', light: '#fef2f2', dark: '#3b1c1c' },
  { key: 'blue', light: '#eff6ff', dark: '#1c2a3b' },
  { key: 'green', light: '#f0fdf4', dark: '#1c3b24' },
  { key: 'yellow', light: '#fefce8', dark: '#3b3a1c' },
  { key: 'purple', light: '#faf5ff', dark: '#2d1c3b' },
  { key: 'orange', light: '#fff7ed', dark: '#3b2a1c' },
];

function getCardColor(colorKey: string | undefined, currentTheme: 'light' | 'dark'): string | undefined {
  if (!colorKey) return undefined;
  const found = colorMap.find((c) => c.key === colorKey);
  if (!found) return undefined;
  return currentTheme === 'dark' ? found.dark : found.light;
}

function NotesList({ notes, onSelect, onNew, onDelete, onPin, onRestore, onPermanentDelete, onExport, theme, onToggleTheme, onShowShortcuts, onShowSettings, onShowStats, onShowCommandPalette, onKanbanStatusChange, onShowPomodoro, onExportZip, pomodoroRunning, onShowOnboarding }: Props) {
  const { t, pluralizeNotes } = useLang();
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('updatedAt');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showTrash, setShowTrash] = useState(false);
  const [filterTag, setFilterTag] = useState<string>('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulk, setConfirmBulk] = useState<'delete' | 'restore' | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);

  const activeNotes = notes.filter((n) => !n.deleted && !n.parentId);
  const trashedNotes = notes.filter((n) => n.deleted);

  // Upcoming reminders (sorted by date, only future ones)
  const upcomingReminders = activeNotes
    .filter((n) => n.reminder && new Date(n.reminder) > new Date())
    .sort((a, b) => new Date(a.reminder!).getTime() - new Date(b.reminder!).getTime())
    .slice(0, 5);

  // Get all unique tags
  const allTags = Array.from(new Set(activeNotes.flatMap((n) => n.tags || [])));

  function sortNotes(notesToSort: Note[]): Note[] {
    const pinned = notesToSort.filter((n) => n.pinned);
    const unpinned = notesToSort.filter((n) => !n.pinned);

    const sortFn = (a: Note, b: Note) => {
      if (sortMode === 'title') {
        return a.title.localeCompare(b.title, 'pl');
      }
      return new Date(b[sortMode]).getTime() - new Date(a[sortMode]).getTime();
    };

    return [...pinned.sort(sortFn), ...unpinned.sort(sortFn)];
  }

  function filterNotes(notesToFilter: Note[]): Note[] {
    let filtered = notesToFilter;

    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter((note) => {
        const titleMatch = note.title.toLowerCase().includes(query);
        const contentMatch = stripHtml(note.content).toLowerCase().includes(query);
        const tagMatch = (note.tags || []).some((tg) => tg.toLowerCase().includes(query));
        return titleMatch || contentMatch || tagMatch;
      });
    }

    if (filterTag) {
      filtered = filtered.filter((note) => (note.tags || []).includes(filterTag));
    }

    return filtered;
  }

  const displayNotes = sortNotes(filterNotes(showTrash ? trashedNotes : activeNotes));

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function stripHtml(html: string) {
    return html
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/p>/gi, ' ')
      .replace(/<\/h[1-6]>/gi, ' ')
      .replace(/<\/li>/gi, ' ')
      .replace(/<\/div>/gi, ' ')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function handleDeleteClick(e: React.MouseEvent, noteId: string) {
    e.stopPropagation();
    setConfirmDelete(noteId);
  }

  function confirmDeleteAction() {
    if (confirmDelete) {
      if (showTrash) {
        onPermanentDelete(confirmDelete);
      } else {
        onDelete(confirmDelete);
      }
      setConfirmDelete(null);
    }
  }

  return (
    <div className="notes-list">
      <div className="notes-list-header">
        <div className="notes-list-header-left">
          <img src="./noteit_sign.png" alt="NoteIt" className="app-logo" />
          {activeNotes.length > 0 && !showTrash && (
            <span className="notes-count">{activeNotes.length} {pluralizeNotes(activeNotes.length)}</span>
          )}
          {showTrash && (
            <span className="notes-count trash-count">{trashedNotes.length} {t('inTrash')}</span>
          )}
        </div>
        <div className="notes-list-header-right">
          <button
            className={`btn-icon ${showTrash ? 'active-trash' : ''}`}
            onClick={() => { setShowTrash(!showTrash); setSelectedIds(new Set()); setSelectionMode(false); }}
            title={showTrash ? t('back') : t('trash')}
            aria-label={showTrash ? t('back') : t('trash')}
          >
            {showTrash ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            )}
          </button>
          <button
            className={`btn-icon ${pomodoroRunning ? 'pomodoro-active' : ''}`}
            onClick={onShowPomodoro}
            title={t('pomodoro')}
            aria-label={t('pomodoro')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </button>
          <button
            className="btn-icon"
            onClick={onShowCommandPalette}
            title={`${t('searchNoteMenu')} (Ctrl+P)`}
            aria-label={t('searchNoteMenu')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <button
            className="btn-icon"
            onClick={onShowStats}
            title={t('statsMenu')}
            aria-label={t('statsMenu')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </button>
          <button
            className="btn-icon"
            onClick={onShowShortcuts}
            title={`${t('shortcutsMenu')} (?)`}
            aria-label={t('shortcutsMenu')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <line x1="6" y1="8" x2="6.01" y2="8"/><line x1="10" y1="8" x2="10.01" y2="8"/><line x1="14" y1="8" x2="14.01" y2="8"/><line x1="18" y1="8" x2="18.01" y2="8"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
              <line x1="6" y1="16" x2="6.01" y2="16"/><line x1="18" y1="16" x2="18.01" y2="16"/>
            </svg>
          </button>
          <button
            className="btn-icon"
            onClick={onShowSettings}
            title={t('settingsMenu')}
            aria-label={t('settingsMenu')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68 1.65 1.65 0 0 0 9 3V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
          <button
            className="btn-icon"
            onClick={onShowOnboarding}
            title={t('instructionMenu')}
            aria-label={t('instructionMenu')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </button>
          {!showTrash && (
            <>
              <button className="btn-icon" onClick={() => window.electronAPI.importFiles().then(() => {})} title={t('importFiles')} aria-label={t('importFiles')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
              <button className="btn btn-primary" onClick={onNew}>
                <PlusIcon size={15} />
                {t('newNote')}
              </button>
            </>
          )}
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            title={theme === 'light' ? t('darkTheme') : t('lightTheme')}
            aria-label={theme === 'light' ? t('darkTheme') : t('lightTheme')}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          <div className="hamburger-wrapper" style={{ position: 'relative' }}>
            <button className="hamburger-btn" onClick={() => setShowHamburger(!showHamburger)} aria-label="Menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            {showHamburger && (
              <div className="hamburger-menu" onMouseLeave={() => setShowHamburger(false)}>
                <button className="hamburger-menu-item" onClick={() => { onShowCommandPalette(); setShowHamburger(false); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  {t('searchNoteMenu')}
                </button>
                <button className={`hamburger-menu-item ${pomodoroRunning ? 'pomodoro-active' : ''}`} onClick={() => { onShowPomodoro(); setShowHamburger(false); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {t('pomodoroMenu')} {pomodoroRunning ? '●' : ''}
                </button>
                <button className="hamburger-menu-item" onClick={() => { onShowStats(); setShowHamburger(false); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  {t('statsMenu')}
                </button>
                <button className="hamburger-menu-item" onClick={() => { onShowShortcuts(); setShowHamburger(false); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                  {t('shortcutsMenu')}
                </button>
                <button className="hamburger-menu-item" onClick={() => { onShowSettings(); setShowHamburger(false); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 0-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  {t('settingsMenu')}
                </button>
                <button className="hamburger-menu-item" onClick={() => { onShowOnboarding(); setShowHamburger(false); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  {t('instructionMenu')}
                </button>
                <div className="hamburger-menu-separator" />
                <button className="hamburger-menu-item" onClick={() => { window.electronAPI.importFiles(); setShowHamburger(false); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  {t('importFiles')}
                </button>
                <button className="hamburger-menu-item" onClick={() => { onToggleTheme(); setShowHamburger(false); }}>
                  {theme === 'light' ? <MoonIcon size={14} /> : <SunIcon size={14} />}
                  {theme === 'light' ? t('darkTheme') : t('lightTheme')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls bar */}
      <div className="controls-bar">
        <div className="search-wrapper">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={t('search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t('search')}
          />
        </div>
        <div className="controls-right">
          <div className="controls-filters">
            {allTags.length > 0 && !showTrash && (
              <select
                className="control-select"
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                aria-label={t('allTags')}
              >
                <option value="">{t('allTags')}</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            )}
            <select
              className="control-select"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              aria-label={t('sortUpdated')}
            >
              <option value="updatedAt">{t('sortUpdated')}</option>
              <option value="createdAt">{t('sortCreated')}</option>
              <option value="title">{t('sortTitle')}</option>
            </select>
          </div>
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title={t('gridView')}
              aria-label={t('gridView')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title={t('listView')}
              aria-label={t('listView')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
            <button
              className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
              title={t('kanbanView')}
              aria-label={t('kanbanView')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="8" rx="1"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Selection toolbar for trash */}
      {showTrash && trashedNotes.length > 0 && (
        <div className="trash-toolbar">
          <div className="trash-toolbar-left">
            {!selectionMode ? (
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectionMode(true)}>
                {t('selecting')}
              </button>
            ) : (
              <>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    if (selectedIds.size === trashedNotes.length) {
                      setSelectedIds(new Set());
                    } else {
                      setSelectedIds(new Set(trashedNotes.map((n) => n.id)));
                    }
                  }}
                >
                  {selectedIds.size === trashedNotes.length ? t('deselectAll') : t('selectAll')}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => { setSelectionMode(false); setSelectedIds(new Set()); }}>
                  {t('cancel')}
                </button>
                {selectedIds.size > 0 && (
                  <span className="trash-selected-count">{selectedIds.size} {t('selected')}</span>
                )}
              </>
            )}
          </div>
          {selectionMode && selectedIds.size > 0 && (
            <div className="trash-toolbar-right">
              <button className="btn btn-secondary btn-sm" onClick={() => setConfirmBulk('restore')}>
                {t('restore')}
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => setConfirmBulk('delete')}>
                {t('deletePermanently')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Selection toolbar for main view */}
      {!showTrash && activeNotes.length > 0 && (
        <div className="trash-toolbar">
          <div className="trash-toolbar-left">
            {!selectionMode ? (
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectionMode(true)}>
                {t('selecting')}
              </button>
            ) : (
              <>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const currentDisplay = filterNotes(activeNotes);
                    if (selectedIds.size === currentDisplay.length) {
                      setSelectedIds(new Set());
                    } else {
                      setSelectedIds(new Set(currentDisplay.map((n) => n.id)));
                    }
                  }}
                >
                  {selectedIds.size === filterNotes(activeNotes).length ? t('deselectAll') : t('selectAll')}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => { setSelectionMode(false); setSelectedIds(new Set()); }}>
                  {t('cancel')}
                </button>
                {selectedIds.size > 0 && (
                  <span className="trash-selected-count">{selectedIds.size} {t('selected')}</span>
                )}
              </>
            )}
          </div>
          {selectionMode && selectedIds.size > 0 && (
            <div className="trash-toolbar-right">
              <button className="btn btn-secondary btn-sm" onClick={() => onExportZip(Array.from(selectedIds))}>
                {t('exportZip')}
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => setConfirmBulk('delete')}>
                {t('deleteSelected')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reminders section */}
      {!showTrash && upcomingReminders.length > 0 && (
        <div className="reminders-section">
          <h4 className="reminders-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {t('reminders')}
          </h4>
          <div className="reminders-list">
            {upcomingReminders.map((note) => (
              <div key={note.id} className="reminder-item" onClick={() => onSelect(note)}>
                <span className="reminder-item-title">{note.title}</span>
                <span className="reminder-item-date">
                  {new Date(note.reminder!).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes display */}
      {viewMode === 'kanban' && !showTrash ? (
        <KanbanView
          notes={filterNotes(activeNotes)}
          onSelect={onSelect}
          onStatusChange={onKanbanStatusChange}
        />
      ) : displayNotes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <NoteIcon />
          </div>
          {showTrash ? (
            <p>{t('trashEmpty')}</p>
          ) : search || filterTag ? (
            <p>{t('noResults')}</p>
          ) : (
            <>
              <p>{t('noNotes')}</p>
              <p className="hint">{t('hintNewNote')}</p>
            </>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'notes-grid' : 'notes-list-view'}>
          {displayNotes.map((note) => (
            <div
              key={note.id}
              className={`note-card ${viewMode === 'list' ? 'note-card-list' : ''} ${note.pinned ? 'pinned' : ''}`}
              style={getCardColor(note.color, theme) ? { backgroundColor: getCardColor(note.color, theme) } : undefined}
              onClick={() => {
                if (selectionMode) {
                  setSelectedIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(note.id)) next.delete(note.id);
                    else next.add(note.id);
                    return next;
                  });
                } else if (!showTrash) {
                  onSelect(note);
                }
              }}
            >
              {selectionMode && (
                <input
                  type="checkbox"
                  className="trash-checkbox"
                  checked={selectedIds.has(note.id)}
                  onChange={() => {
                    setSelectedIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(note.id)) next.delete(note.id);
                      else next.add(note.id);
                      return next;
                    });
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              {note.pinned && (
                <div className="pin-indicator" title={t('pinned')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
                    <path d="M12 2C9.243 2 7 4.243 7 7c0 2.475 1.639 4.57 3.89 5.271L12 22l1.11-9.729C15.361 11.57 17 9.475 17 7c0-2.757-2.243-5-5-5z"/>
                  </svg>
                </div>
              )}
              <div className="note-card-header">
                <h3>
                  {note.locked && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: 'middle', opacity: 0.6 }}>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  )}
                  {note.title || t('untitled')}
                </h3>
                <div className="note-card-actions">
                  {!showTrash && !selectionMode && (
                    <>
                      <button
                        className={`btn-icon btn-pin ${note.pinned ? 'pinned' : ''}`}
                        onClick={(e) => { e.stopPropagation(); onPin(note.id); }}
                        title={note.pinned ? t('pinned') : t('pinned')}
                        aria-label={t('pinned')}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={note.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                          <path d="M12 2C9.243 2 7 4.243 7 7c0 2.475 1.639 4.57 3.89 5.271L12 22l1.11-9.729C15.361 11.57 17 9.475 17 7c0-2.757-2.243-5-5-5z"/>
                        </svg>
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={(e) => handleDeleteClick(e, note.id)}
                        title={t('deleteNote')}
                        aria-label={t('deleteNote')}
                      >
                        <TrashIcon size={14} />
                      </button>
                    </>
                  )}
                  {showTrash && !selectionMode && (
                    <>
                      <button
                        className="btn-icon btn-restore"
                        onClick={(e) => { e.stopPropagation(); onRestore(note.id); }}
                        title={t('restore')}
                        aria-label={t('restore')}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                        </svg>
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={(e) => handleDeleteClick(e, note.id)}
                        title={t('deletePermanently')}
                        aria-label={t('deletePermanently')}
                      >
                        <TrashIcon size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              {(note.tags || []).length > 0 && (
                <div className="note-tags">
                  {(note.tags || []).map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
              <p className={`note-preview ${note.locked ? 'note-preview-locked' : ''}`}>{stripHtml(note.content).slice(0, viewMode === 'list' ? 150 : 80)}</p>
              <div className="note-dates">
                <span className="note-date" title={t('created')}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {formatDate(note.createdAt)}
                </span>
                <span className="note-date" title={t('edited')}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  {formatDate(note.updatedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{showTrash ? t('deleteForever') : t('moveToTrash')}</h3>
            <p>{showTrash ? t('deleteForeverInfo') : t('trashInfo')}</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>{t('cancel')}</button>
              <button className="btn btn-danger" onClick={confirmDeleteAction}>{t('delete')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk action confirmation modal */}
      {confirmBulk && (
        <div className="modal-overlay" onClick={() => setConfirmBulk(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {confirmBulk === 'delete' && showTrash && t('deleteForever')}
              {confirmBulk === 'delete' && !showTrash && t('moveToTrash')}
              {confirmBulk === 'restore' && t('restoreNotes')}
            </h3>
            <p>
              {confirmBulk === 'delete' && showTrash && t('deleteForeverInfo')}
              {confirmBulk === 'delete' && !showTrash && t('trashInfo')}
              {confirmBulk === 'restore' && t('restoreInfo')}
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmBulk(null)}>{t('cancel')}</button>
              <button
                className={confirmBulk === 'delete' ? 'btn btn-danger' : 'btn btn-primary'}
                onClick={() => {
                  selectedIds.forEach((id) => {
                    if (confirmBulk === 'delete' && showTrash) onPermanentDelete(id);
                    else if (confirmBulk === 'delete' && !showTrash) onDelete(id);
                    else onRestore(id);
                  });
                  setSelectedIds(new Set());
                  setSelectionMode(false);
                  setConfirmBulk(null);
                }}
              >
                {confirmBulk === 'delete' ? t('delete') : t('restore')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotesList;
