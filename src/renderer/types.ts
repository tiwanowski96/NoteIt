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
}

export type SortMode = 'updatedAt' | 'createdAt' | 'title';
export type ViewMode = 'grid' | 'list';

export interface ElectronAPI {
  getNotes: () => Promise<Note[]>;
  saveNote: (note: Note) => Promise<Note[]>;
  deleteNote: (noteId: string) => Promise<Note[]>;
  permanentDeleteNote: (noteId: string) => Promise<Note[]>;
  restoreNote: (noteId: string) => Promise<Note[]>;
  saveImage: (dataUrl: string) => Promise<string>;
  openNoteWindow: (noteId: string) => Promise<void>;
  setTheme: (theme: string) => Promise<void>;
  exportNote: (noteId: string, format: string) => Promise<void>;
  onShowAllNotes: (callback: () => void) => () => void;
  onShowLastNote: (callback: () => void) => () => void;
  onThemeChanged: (callback: (theme: string) => void) => () => void;
  onNotesUpdated: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
