import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getNotes: () => ipcRenderer.invoke('get-notes'),
  windowAction: (action: string) => ipcRenderer.invoke('window-action', action),
  saveNote: (note: any) => ipcRenderer.invoke('save-note', note),
  deleteNote: (noteId: string) => ipcRenderer.invoke('delete-note', noteId),
  permanentDeleteNote: (noteId: string) => ipcRenderer.invoke('permanent-delete-note', noteId),
  restoreNote: (noteId: string) => ipcRenderer.invoke('restore-note', noteId),
  saveImage: (dataUrl: string) => ipcRenderer.invoke('save-image', dataUrl),
  openNoteWindow: (noteId: string) => ipcRenderer.invoke('open-note-window', noteId),
  setTheme: (theme: string) => ipcRenderer.invoke('set-theme', theme),
  setPomodoroRunning: (running: boolean) => ipcRenderer.invoke('set-pomodoro-running', running),
  setAlwaysOnTop: (value: boolean) => ipcRenderer.invoke('set-always-on-top', value),
  openPomodoroMini: (mode: string, timeLeft: number, isRunning: boolean) => ipcRenderer.invoke('open-pomodoro-mini', mode, timeLeft, isRunning),
  closePomodoroMini: () => ipcRenderer.invoke('close-pomodoro-mini'),
  updatePomodoroMini: (mode: string, timeLeft: number, isRunning: boolean, theme: string) => ipcRenderer.invoke('update-pomodoro-mini', mode, timeLeft, isRunning, theme),
  onPomodoroAction: (callback: (action: string) => void) => {
    const handler = (_event: any, action: string) => callback(action);
    ipcRenderer.on('pomodoro-action', handler);
    return () => ipcRenderer.removeListener('pomodoro-action', handler);
  },
  onCheckQuit: (callback: () => void) => {
    ipcRenderer.on('check-quit', callback);
    return () => ipcRenderer.removeListener('check-quit', callback);
  },
  confirmQuit: (canQuit: boolean) => ipcRenderer.send('confirm-quit', canQuit),
  forceQuit: () => ipcRenderer.send('force-quit'),
  exportNote: (noteId: string, format: string) => ipcRenderer.invoke('export-note', noteId, format),
  importFiles: () => ipcRenderer.invoke('import-files'),
  exportZip: (noteIds: string[]) => ipcRenderer.invoke('export-zip', noteIds),
  onShowAllNotes: (callback: () => void) => {
    ipcRenderer.on('show-all-notes', callback);
    return () => ipcRenderer.removeListener('show-all-notes', callback);
  },
  onShowLastNote: (callback: () => void) => {
    ipcRenderer.on('show-last-note', callback);
    return () => ipcRenderer.removeListener('show-last-note', callback);
  },
  focusMainWindow: () => ipcRenderer.invoke('focus-main-window'),
  moveNoteToParent: (noteId: string, parentId: string | null) => ipcRenderer.invoke('move-note-to-parent', noteId, parentId),
  createChildNote: (parentId: string, title: string) => ipcRenderer.invoke('create-child-note', parentId, title),
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
