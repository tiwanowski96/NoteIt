import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Note } from './types';
import { Lang } from './i18n';
import { LangProvider } from './LangContext';
import NotesList from './components/NotesList';
import NoteEditor from './components/NoteEditor';
import TemplateModal, { Template } from './components/Templates';
import ShortcutsPanel from './components/ShortcutsPanel';
import Onboarding from './components/Onboarding';
import CommandPalette from './components/CommandPalette';
import Settings from './components/Settings';
import Stats from './components/Stats';
import PomodoroTimer from './components/PomodoroTimer';
import WindowControls from './components/WindowControls';
import { UnlockModal } from './components/LockNote';

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
  const [editorFontSize, setEditorFontSize] = useState(15);
  const [alwaysOnTop, setAlwaysOnTop] = useState(false);
  const [lang, setLang] = useState<Lang>('en');
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [showPomodoroMini, setShowPomodoroMini] = useState(false);
  const [showUnlock, setShowUnlock] = useState<Note | null>(null);
  const [unlockError, setUnlockError] = useState(false);

  // Pomodoro global state (persists when modal is closed)
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<'work' | 'break'>('work');
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState(25 * 60);
  const [pomodoroSessions, setPomodoroSessions] = useState(0);
  const [pomodoroWork, setPomodoroWork] = useState(25);
  const [pomodoroBreak, setPomodoroBreak] = useState(5);
  const pomodoroIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update mini pomodoro window when timer ticks
  useEffect(() => {
    if (showPomodoroMini) {
      window.electronAPI.updatePomodoroMini(pomodoroMode, pomodoroTimeLeft, pomodoroRunning, theme);
    }
  }, [pomodoroTimeLeft, pomodoroMode, pomodoroRunning, showPomodoroMini, theme]);

  // Listen for actions from mini pomodoro window
  useEffect(() => {
    const unsub = window.electronAPI.onPomodoroAction((action: string) => {
      if (action === 'toggle') {
        setPomodoroRunning((r) => !r);
      } else if (action === 'expand') {
        window.electronAPI.closePomodoroMini();
        setShowPomodoroMini(false);
        setShowPomodoro(true);
      } else if (action === 'close') {
        setShowPomodoroMini(false);
      }
    });
    return unsub;
  }, []);

  // Pomodoro background timer
  useEffect(() => {
    if (pomodoroRunning) {
      window.electronAPI.setPomodoroRunning(true);
      pomodoroIntervalRef.current = setInterval(() => {
        setPomodoroTimeLeft((prev) => {
          if (prev <= 1) {
            setPomodoroRunning(false);
            playPomodoroAlarm();
            if (pomodoroMode === 'work') {
              setPomodoroSessions((s) => s + 1);
              setPomodoroMode('break');
              return pomodoroBreak * 60;
            } else {
              setPomodoroMode('work');
              return pomodoroWork * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (pomodoroIntervalRef.current) clearInterval(pomodoroIntervalRef.current);
      window.electronAPI.setPomodoroRunning(false);
    };
  }, [pomodoroRunning, pomodoroMode, pomodoroWork, pomodoroBreak]);

  function playPomodoroAlarm() {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch {}
  }

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
      const zoom = size / 15;
      document.documentElement.style.setProperty('--app-zoom', String(zoom));
    }
    const savedEditorFontSize = localStorage.getItem('noteit-editor-font-size');
    if (savedEditorFontSize) setEditorFontSize(Number(savedEditorFontSize));
    const savedLang = localStorage.getItem('noteit-lang') as Lang | null;
    if (savedLang) setLang(savedLang);
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
    const zoom = size / 15; // 12=0.8, 15=1.0, 18=1.2
    document.documentElement.style.setProperty('--app-zoom', String(zoom));
  };

  const handleEditorFontSizeChange = (size: number) => {
    setEditorFontSize(size);
    localStorage.setItem('noteit-editor-font-size', String(size));
  };

  const handleLangChange = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('noteit-lang', newLang);
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
    if (note.locked) {
      setShowUnlock(note);
      setUnlockError(false);
    } else {
      window.electronAPI.openNoteWindow(note.id);
    }
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

  const handleExportZip = (noteIds: string[]) => {
    window.electronAPI.exportZip(noteIds);
  };

  const handleCreateChildNote = async (parentId: string) => {
    const newNoteId = await window.electronAPI.createChildNote(parentId, 'Podnotatka');
    await loadNotes();
    window.electronAPI.openNoteWindow(newNoteId);
  };

  const handleMoveToRoot = async (noteId: string) => {
    await window.electronAPI.moveNoteToParent(noteId, null);
    loadNotes();
  };

  const handleMoveToParent = async (noteId: string, parentId: string) => {
    await window.electronAPI.moveNoteToParent(noteId, parentId);
    loadNotes();
  };

  const handleBack = () => {
    if (windowMode === 'editor' || windowMode === 'last') {
      // If note has parent, navigate to parent instead of closing
      if (selectedNote?.parentId) {
        window.electronAPI.openNoteWindow(selectedNote.parentId);
      } else {
        window.electronAPI.focusMainWindow();
      }
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
      <LangProvider lang={lang}>
      <div className="app">
        <WindowControls />
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
          allNotes={notes}
          onNavigateNote={(id) => window.electronAPI.openNoteWindow(id)}
          onCreateChild={handleCreateChildNote}
        />
      </div>
      </LangProvider>
    );
  }

  // Main list window
  return (
    <LangProvider lang={lang}>
    <div className="app">
      <WindowControls />
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
          onShowPomodoro={() => setShowPomodoro(true)}
          onExportZip={handleExportZip}
          pomodoroRunning={pomodoroRunning}
          onShowOnboarding={() => setShowOnboarding(true)}
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
          allNotes={notes}
          onNavigateNote={(id) => window.electronAPI.openNoteWindow(id)}
          onCreateChild={handleCreateChildNote}
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
        <Onboarding
          onComplete={() => {
            setShowOnboarding(false);
            localStorage.setItem('noteit-onboarded', 'true');
          }}
          lang={lang}
          onLangChange={handleLangChange}
          theme={theme}
          onThemeChange={toggleTheme}
        />
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
          lang={lang}
          onLangChange={handleLangChange}
          onClose={() => setShowSettings(false)}
        />
      )}
      {showStats && (
        <Stats notes={notes} onClose={() => setShowStats(false)} />
      )}
      {showUnlock && (
        <UnlockModal
          error={unlockError}
          onUnlock={async (pin) => {
            const ok = await window.electronAPI.unlockNote(showUnlock.id, pin);
            if (ok) {
              setShowUnlock(null);
              setUnlockError(false);
              window.electronAPI.openNoteWindow(showUnlock.id);
            } else {
              setUnlockError(true);
            }
          }}
          onClose={() => { setShowUnlock(null); setUnlockError(false); }}
        />
      )}
      {showPomodoro && (
        <PomodoroTimer
          mode={pomodoroMode}
          timeLeft={pomodoroTimeLeft}
          isRunning={pomodoroRunning}
          sessions={pomodoroSessions}
          workMinutes={pomodoroWork}
          breakMinutes={pomodoroBreak}
          onToggleRunning={() => setPomodoroRunning(!pomodoroRunning)}
          onReset={() => { setPomodoroRunning(false); setPomodoroTimeLeft(pomodoroMode === 'work' ? pomodoroWork * 60 : pomodoroBreak * 60); }}
          onSkip={() => {
            setPomodoroRunning(false);
            if (pomodoroMode === 'work') { setPomodoroSessions((s) => s + 1); setPomodoroMode('break'); setPomodoroTimeLeft(pomodoroBreak * 60); }
            else { setPomodoroMode('work'); setPomodoroTimeLeft(pomodoroWork * 60); }
          }}
          onSetMode={(m) => { setPomodoroMode(m); setPomodoroTimeLeft(m === 'work' ? pomodoroWork * 60 : pomodoroBreak * 60); setPomodoroRunning(false); }}
          onSetWorkMinutes={(v) => { setPomodoroWork(v); if (pomodoroMode === 'work' && !pomodoroRunning) setPomodoroTimeLeft(v * 60); }}
          onSetBreakMinutes={(v) => { setPomodoroBreak(v); if (pomodoroMode === 'break' && !pomodoroRunning) setPomodoroTimeLeft(v * 60); }}
          onClose={() => setShowPomodoro(false)}
          onMiniMode={() => {
            setShowPomodoro(false);
            setShowPomodoroMini(true);
            window.electronAPI.openPomodoroMini(pomodoroMode, pomodoroTimeLeft, pomodoroRunning);
          }}
        />
      )}
    </div>
    </LangProvider>
  );
}

export default App;
