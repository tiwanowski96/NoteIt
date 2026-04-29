import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getNotes: () => ipcRenderer.invoke('get-notes'),
  saveNote: (note: any) => ipcRenderer.invoke('save-note', note),
  deleteNote: (noteId: string) => ipcRenderer.invoke('delete-note', noteId),
  permanentDeleteNote: (noteId: string) => ipcRenderer.invoke('permanent-delete-note', noteId),
  restoreNote: (noteId: string) => ipcRenderer.invoke('restore-note', noteId),
  saveImage: (dataUrl: string) => ipcRenderer.invoke('save-image', dataUrl),
  openNoteWindow: (noteId: string) => ipcRenderer.invoke('open-note-window', noteId),
  setTheme: (theme: string) => ipcRenderer.invoke('set-theme', theme),
  exportNote: (noteId: string, format: string) => ipcRenderer.invoke('export-note', noteId, format),
  importFiles: () => ipcRenderer.invoke('import-files'),
  onShowAllNotes: (callback: () => void) => {
    ipcRenderer.on('show-all-notes', callback);
    return () => ipcRenderer.removeListener('show-all-notes', callback);
  },
  onShowLastNote: (callback: () => void) => {
    ipcRenderer.on('show-last-note', callback);
    return () => ipcRenderer.removeListener('show-last-note', callback);
  },
  focusMainWindow: () => ipcRenderer.invoke('focus-main-window'),
  onThemeChanged: (callback: (theme: string) => void) => {
    const handler = (_event: any, theme: string) => callback(theme);
    ipcRenderer.on('theme-changed', handler);
    return () => ipcRenderer.removeListener('theme-changed', handler);
  },
  onNotesUpdated: (callback: () => void) => {
    ipcRenderer.on('notes-updated', callback);
    return () => ipcRenderer.removeListener('notes-updated', callback);
  },
  onPasteScreenshot: (callback: (dataUrl: string) => void) => {
    const handler = (_event: any, dataUrl: string) => callback(dataUrl);
    ipcRenderer.on('paste-screenshot', handler);
    return () => ipcRenderer.removeListener('paste-screenshot', handler);
  },
});
