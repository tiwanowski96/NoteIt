import React, { useState } from 'react';
import { Note, SortMode, ViewMode } from '../types';
import { PlusIcon, TrashIcon, SearchIcon, NoteIcon, SunIcon, MoonIcon } from './Icons';

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

function NotesList({ notes, onSelect, onNew, onDelete, onPin, onRestore, onPermanentDelete, onExport, theme, onToggleTheme }: Props) {
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('updatedAt');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showTrash, setShowTrash] = useState(false);
  const [filterTag, setFilterTag] = useState<string>('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const activeNotes = notes.filter((n) => !n.deleted);
  const trashedNotes = notes.filter((n) => n.deleted);

  // Get all unique tags
  const allTags = Array.from(new Set(activeNotes.flatMap((n) => n.tags || [])));

  function pluralizeNotes(count: number): string {
    if (count === 1) return 'notatka';
    const lastTwo = count % 100;
    const lastOne = count % 10;
    if (lastTwo >= 12 && lastTwo <= 14) return 'notatek';
    if (lastOne >= 2 && lastOne <= 4) return 'notatki';
    return 'notatek';
  }

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
        const tagMatch = (note.tags || []).some((t) => t.toLowerCase().includes(query));
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

  const noteColors = [
    { label: 'Brak', value: '' },
    { label: 'Czerwony', value: '#fef2f2' },
    { label: 'Niebieski', value: '#eff6ff' },
    { label: 'Zielony', value: '#f0fdf4' },
    { label: 'Żółty', value: '#fefce8' },
    { label: 'Fioletowy', value: '#faf5ff' },
    { label: 'Pomarańczowy', value: '#fff7ed' },
  ];

  return (
    <div className="notes-list">
      <div className="notes-list-header">
        <div className="notes-list-header-left">
          <img src="./noteit_sign.png" alt="NoteIt" className="app-logo" />
          {activeNotes.length > 0 && !showTrash && (
            <span className="notes-count">{activeNotes.length} {pluralizeNotes(activeNotes.length)}</span>
          )}
          {showTrash && (
            <span className="notes-count trash-count">{trashedNotes.length} w koszu</span>
          )}
        </div>
        <div className="notes-list-header-right">
          <button
            className={`btn-icon ${showTrash ? 'active-trash' : ''}`}
            onClick={() => setShowTrash(!showTrash)}
            title="Kosz"
            aria-label="Kosz"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            title={theme === 'light' ? 'Ciemny motyw' : 'Jasny motyw'}
            aria-label={theme === 'light' ? 'Przełącz na ciemny motyw' : 'Przełącz na jasny motyw'}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          {!showTrash && (
            <button className="btn btn-primary" onClick={onNew}>
              <PlusIcon size={15} />
              Nowa notatka
            </button>
          )}
        </div>
      </div>

      {/* Controls bar */}
      <div className="controls-bar">
        <div className="search-wrapper">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Szukaj notatek..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Szukaj notatek"
          />
        </div>
        <div className="controls-right">
          {allTags.length > 0 && !showTrash && (
            <select
              className="control-select"
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              aria-label="Filtruj po tagu"
            >
              <option value="">Wszystkie tagi</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          )}
          <select
            className="control-select"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            aria-label="Sortowanie"
          >
            <option value="updatedAt">Ostatnio edytowane</option>
            <option value="createdAt">Data utworzenia</option>
            <option value="title">Nazwa</option>
          </select>
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Widok kafelków"
              aria-label="Widok kafelków"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Widok listy"
              aria-label="Widok listy"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Notes display */}
      {displayNotes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <NoteIcon />
          </div>
          {showTrash ? (
            <p>Kosz jest pusty</p>
          ) : search || filterTag ? (
            <p>Brak wyników</p>
          ) : (
            <>
              <p>Brak notatek</p>
              <p className="hint">Kliknij "Nowa notatka" lub Ctrl+N</p>
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
              onClick={() => !showTrash && onSelect(note)}
            >
              {note.pinned && (
                <div className="pin-indicator" title="Przypięta">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
                    <path d="M12 2C9.243 2 7 4.243 7 7c0 2.475 1.639 4.57 3.89 5.271L12 22l1.11-9.729C15.361 11.57 17 9.475 17 7c0-2.757-2.243-5-5-5z"/>
                  </svg>
                </div>
              )}
              <div className="note-card-header">
                <h3>{note.title || 'Bez tytułu'}</h3>
                <div className="note-card-actions">
                  {!showTrash && (
                    <>
                      <button
                        className={`btn-icon btn-pin ${note.pinned ? 'pinned' : ''}`}
                        onClick={(e) => { e.stopPropagation(); onPin(note.id); }}
                        title={note.pinned ? 'Odepnij' : 'Przypnij'}
                        aria-label={note.pinned ? 'Odepnij' : 'Przypnij'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={note.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                          <path d="M12 2C9.243 2 7 4.243 7 7c0 2.475 1.639 4.57 3.89 5.271L12 22l1.11-9.729C15.361 11.57 17 9.475 17 7c0-2.757-2.243-5-5-5z"/>
                        </svg>
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={(e) => handleDeleteClick(e, note.id)}
                        title="Usuń notatkę"
                        aria-label="Usuń notatkę"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </>
                  )}
                  {showTrash && (
                    <>
                      <button
                        className="btn-icon btn-restore"
                        onClick={(e) => { e.stopPropagation(); onRestore(note.id); }}
                        title="Przywróć"
                        aria-label="Przywróć"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                        </svg>
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={(e) => handleDeleteClick(e, note.id)}
                        title="Usuń na stałe"
                        aria-label="Usuń na stałe"
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
              <p className="note-preview">{stripHtml(note.content).slice(0, viewMode === 'list' ? 200 : 120)}</p>
              <div className="note-dates">
                <span className="note-date" title="Utworzono">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {formatDate(note.createdAt)}
                </span>
                <span className="note-date" title="Edytowano">
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
            <h3>{showTrash ? 'Usunąć na stałe?' : 'Przenieść do kosza?'}</h3>
            <p>{showTrash ? 'Tej operacji nie można cofnąć.' : 'Notatka trafi do kosza na 30 dni.'}</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Anuluj</button>
              <button className="btn btn-danger" onClick={confirmDeleteAction}>Usuń</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotesList;
