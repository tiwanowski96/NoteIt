import React, { useState, useEffect, useCallback } from 'react';
import { Note } from './types';
import NotesList from './components/NotesList';
import NoteEditor from './components/NoteEditor';
import TemplateModal, { Template } from './components/Templates';
import ShortcutsPanel from './components/ShortcutsPanel';
import Onboarding from './components/Onboarding';
import CommandPalette from './components/CommandPalette';
import Settings from './components/Settings';
import Stats from './components/Stats';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [fontSize, setFontSize] = useState(15);
  const [alwaysOnTop, setAlwaysOnTop] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const windowMode = params.get('mode');
  const noteId = params.get('noteId');

  const loadNotes = useCallback(async () => {
    const loaded = await window.electronAPI.getNotes();
    setNotes(loaded);
    return loaded;
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('noteit-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    const savedFontSize = localStorage.getItem('noteit-font-size');
    if (savedFontSize) {
      const size = Number(savedFontSize);
      setFontSize(size);
      document.documentElement.style.setProperty('--app-font-size', `${size}px`);
    }
    // Show onboarding on first launch
    if (!windowMode && !localStorage.getItem('noteit-onboarded')) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    const unsub = window.electronAPI.onThemeChanged((newTheme: string) => {
      const t = newTheme as 'light' | 'dark';
      setTheme(t);
      localStorage.setItem('noteit-theme', t);
      document.documentElement.setAttribute('data-theme', t);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = window.electronAPI.onNotesUpdated(() => {
      loadNotes();
    });
    return unsub;
  }, [loadNotes]);

  useEffect(() => {
    loadNotes().then((loaded) => {
      if (windowMode === 'editor' && noteId && loaded.length > 0) {
        const note = loaded.find((n) => n.id === noteId);
        if (note) {
          setSelectedNote(note);
          setView('editor');
        }
      } else if (windowMode === 'last' && loaded.length > 0) {
        const sorted = [...loaded].filter((n) => !n.deleted).sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        if (sorted[0]) {
          setSelectedNote(sorted[0]);
          setView('editor');
        }
      }
    });
  }, [loadNotes, windowMode, noteId]);

  useEffect(() => {
    if (!windowMode) {
      const unsubAll = window.electronAPI.onShowAllNotes(() => {
        setView('list');
        setSelectedNote(null);
        loadNotes();
      });

      const unsubLast = window.electronAPI.onShowLastNote(async () => {
        const loaded = await loadNotes();
        const active = loaded.filter((n) => !n.deleted);
        if (active.length > 0) {
          const sorted = [...active].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          setSelectedNote(sorted[0]);
          setView('editor');
        }
      });

      return () => {
        unsubAll();
        unsubLast();
      };
    }
  }, [loadNotes, windowMode]);

  // Ctrl+N shortcut for new note (in list window)
  useEffect(() => {
    if (windowMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewNote();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !(e.target as HTMLElement).matches('input, textarea, [contenteditable]')) {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notes]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('noteit-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    window.electronAPI.setTheme(newTheme);
  };

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    localStorage.setItem('noteit-font-size', String(size));
    document.documentElement.style.setProperty('--app-font-size', `${size}px`);
  };

  const handleToggleAlwaysOnTop = () => {
    const newVal = !alwaysOnTop;
    setAlwaysOnTop(newVal);
    window.electronAPI.setAlwaysOnTop(newVal);
  };

  const handleNewNote = () => {
    setShowTemplates(true);
  };

  const handleCreateFromTemplate = (template?: Template) => {
    setShowTemplates(false);
    const baseTitle = template ? template.name : 'Nowa notatka';
    let title = baseTitle;
    const existingTitles = notes.filter((n) => !n.deleted).map((n) => n.title);
    if (existingTitles.includes(title)) {
      let counter = 2;
      while (existingTitles.includes(`${baseTitle} ${counter}`)) {
        counter++;
      }
      title = `${baseTitle} ${counter}`;
    }

    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content: template ? template.content : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false,
      tags: [],
      color: '',
    };
    window.electronAPI.saveNote(newNote).then(() => {
      window.electronAPI.openNoteWindow(newNote.id);
      loadNotes();
    });
  };

  const handleSelectNote = (note: Note) => {
    window.electronAPI.openNoteWindow(note.id);
  };

  const handleSaveNote = async (note: Note) => {
    const updated = await window.electronAPI.saveNote({
      ...note,
      updatedAt: new Date().toISOString(),
    });
    setNotes(updated);
  };

  const handleDeleteNote = async (id: string) => {
    await window.electronAPI.deleteNote(id);
    if ((windowMode === 'editor' || windowMode === 'last') && noteId === id) {
      window.close();
    } else {
      loadNotes();
      setSelectedNote(null);
      setView('list');
    }
  };

  const handlePinNote = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (note) {
      await window.electronAPI.saveNote({
        ...note,
        pinned: !note.pinned,
        updatedAt: note.updatedAt, // Don't change updatedAt for pin toggle
      });
      loadNotes();
    }
  };

  const handleRestoreNote = async (id: string) => {
    await window.electronAPI.restoreNote(id);
    loadNotes();
  };

  const handlePermanentDelete = async (id: string) => {
    await window.electronAPI.permanentDeleteNote(id);
    loadNotes();
  };

  const handleExportNote = (id: string, format: string) => {
    window.electronAPI.exportNote(id, format);
  };

  const handleKanbanStatusChange = async (noteId: string, status: 'todo' | 'inprogress' | 'done') => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      await window.electronAPI.saveNote({ ...note, kanbanStatus: status });
      loadNotes();
    }
  };

  const handleBack = () => {
    if (windowMode === 'editor' || windowMode === 'last') {
      window.electronAPI.focusMainWindow();
      window.close();
    } else {
      setView('list');
      setSelectedNote(null);
      loadNotes();
    }
  };

  // Editor window mode
  if ((windowMode === 'editor' || windowMode === 'last') && selectedNote) {
    return (
      <div className="app">
        <NoteEditor
          note={selectedNote}
          onSave={handleSaveNote}
          onBack={handleBack}
          onDelete={() => handleDeleteNote(selectedNote.id)}
          theme={theme}
          onToggleTheme={toggleTheme}
          fontSize={fontSize}
          alwaysOnTop={alwaysOnTop}
          onToggleAlwaysOnTop={handleToggleAlwaysOnTop}
        />
      </div>
    );
  }

  // Main list window
  return (
    <div className="app">
      {view === 'list' ? (
        <NotesList
          notes={notes}
          onSelect={handleSelectNote}
          onNew={handleNewNote}
          onDelete={handleDeleteNote}
          onPin={handlePinNote}
          onRestore={handleRestoreNote}
          onPermanentDelete={handlePermanentDelete}
          onExport={handleExportNote}
          theme={theme}
          onToggleTheme={toggleTheme}
          onShowShortcuts={() => setShowShortcuts(true)}
          onShowSettings={() => setShowSettings(true)}
          onShowStats={() => setShowStats(true)}
          onShowCommandPalette={() => setShowCommandPalette(true)}
          onKanbanStatusChange={handleKanbanStatusChange}
        />
      ) : (
        <NoteEditor
          note={selectedNote!}
          onSave={handleSaveNote}
          onBack={handleBack}
          onDelete={() => selectedNote && handleDeleteNote(selectedNote.id)}
          theme={theme}
          onToggleTheme={toggleTheme}
          fontSize={fontSize}
          alwaysOnTop={alwaysOnTop}
          onToggleAlwaysOnTop={handleToggleAlwaysOnTop}
        />
      )}
      {showTemplates && (
        <TemplateModal
          onSelect={handleCreateFromTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}
      {showShortcuts && (
        <ShortcutsPanel onClose={() => setShowShortcuts(false)} />
      )}
      {showOnboarding && (
        <Onboarding onComplete={() => {
          setShowOnboarding(false);
          localStorage.setItem('noteit-onboarded', 'true');
        }} />
      )}
      {showCommandPalette && (
        <CommandPalette
          notes={notes}
          onSelect={(note) => { setShowCommandPalette(false); handleSelectNote(note); }}
          onClose={() => setShowCommandPalette(false)}
        />
      )}
      {showSettings && (
        <Settings
          fontSize={fontSize}
          onFontSizeChange={handleFontSizeChange}
          onClose={() => setShowSettings(false)}
        />
      )}
      {showStats && (
        <Stats notes={notes} onClose={() => setShowStats(false)} />
      )}
    </div>
  );
}

export default App;
