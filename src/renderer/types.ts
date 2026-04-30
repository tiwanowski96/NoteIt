export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
  tags?: string[];
  color?: string;
  deleted?: boolean;
  deletedAt?: string;
  reminder?: string;
  kanbanStatus?: 'todo' | 'inprogress' | 'done';
  parentId?: string;
  childrenOrder?: string[];
  locked?: boolean;
  lockHash?: string;
}

export type SortMode = 'updatedAt' | 'createdAt' | 'title';
export type ViewMode = 'grid' | 'list' | 'kanban';

export interface ElectronAPI {
  getNotes: () => Promise<Note[]>;
  windowAction: (action: string) => Promise<void>;
  saveNote: (note: Note) => Promise<Note[]>;
  deleteNote: (noteId: string) => Promise<Note[]>;
  permanentDeleteNote: (noteId: string) => Promise<Note[]>;
  restoreNote: (noteId: string) => Promise<Note[]>;
  saveImage: (dataUrl: string) => Promise<string>;
  openNoteWindow: (noteId: string) => Promise<void>;
  openStickyNote: (noteId: string) => Promise<void>;
  setTheme: (theme: string) => Promise<void>;
  setPomodoroRunning: (running: boolean) => Promise<void>;
  lockNote: (noteId: string, pin: string) => Promise<boolean>;
  setAutoStart: (value: boolean) => Promise<void>;
  getAutoStart: () => Promise<boolean>;
  setShowOnStart: (value: boolean) => Promise<void>;
  unlockNote: (noteId: string, pin: string) => Promise<boolean>;
  removeLock: (noteId: string) => Promise<void>;
  setAlwaysOnTop: (value: boolean) => Promise<void>;
  openPomodoroMini: (mode: string, timeLeft: number, isRunning: boolean) => Promise<void>;
  closePomodoroMini: () => Promise<void>;
  updatePomodoroMini: (mode: string, timeLeft: number, isRunning: boolean, theme: string) => Promise<void>;
  onPomodoroAction: (callback: (action: string) => void) => () => void;
  onCheckQuit: (callback: () => void) => () => void;
  confirmQuit: (canQuit: boolean) => void;
  forceQuit: () => void;
  exportNote: (noteId: string, format: string) => Promise<void>;
  importFiles: () => Promise<Note[]>;
  exportZip: (noteIds: string[]) => Promise<void>;
  onShowAllNotes: (callback: () => void) => () => void;
  onShowLastNote: (callback: () => void) => () => void;
  focusMainWindow: () => Promise<void>;
  moveNoteToParent: (noteId: string, parentId: string | null) => Promise<Note[]>;
  createChildNote: (parentId: string, title: string) => Promise<string>;
  onThemeChanged: (callback: (theme: string) => void) => () => void;
  onNotesUpdated: (callback: () => void) => () => void;
  onPasteScreenshot: (callback: (dataUrl: string) => void) => () => void;
  openExternal: (url: string) => Promise<void>;
  setCheckUpdates: (value: boolean) => Promise<void>;
  getCheckUpdates: () => Promise<boolean>;
  onUpdateAvailable: (callback: (data: { version: string; url: string }) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
