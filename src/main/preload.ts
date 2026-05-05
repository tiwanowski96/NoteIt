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
  openStickyNote: (noteId: string) => ipcRenderer.invoke('open-sticky-note', noteId),
  setTheme: (theme: string) => ipcRenderer.invoke('set-theme', theme),
  setPomodoroRunning: (running: boolean) => ipcRenderer.invoke('set-pomodoro-running', running),
  lockNote: (noteId: string, pin: string) => ipcRenderer.invoke('lock-note', noteId, pin),
  setAutoStart: (value: boolean) => ipcRenderer.invoke('set-auto-start', value),
  getAutoStart: () => ipcRenderer.invoke('get-auto-start'),
  setShowOnStart: (value: boolean) => ipcRenderer.invoke('set-show-on-start', value),
  unlockNote: (noteId: string, pin: string) => ipcRenderer.invoke('unlock-note', noteId, pin),
  removeLock: (noteId: string) => ipcRenderer.invoke('remove-lock', noteId),
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
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  setCheckUpdates: (value: boolean) => ipcRenderer.invoke('set-check-updates', value),
  getCheckUpdates: () => ipcRenderer.invoke('get-check-updates'),
  onUpdateAvailable: (callback: (data: { version: string; url: string }) => void) => {
    const handler = (_event: any, data: any) => callback(data);
    ipcRenderer.on('update-available', handler);
    return () => ipcRenderer.removeListener('update-available', handler);
  },
  onShowVaultModal: (callback: () => void) => {
    ipcRenderer.on('show-vault-modal', callback);
    return () => ipcRenderer.removeListener('show-vault-modal', callback);
  },
  vaultExists: () => ipcRenderer.invoke('vault-exists'),
  vaultCreate: (password: string, vaultName: string) => ipcRenderer.invoke('vault-create', password, vaultName),
  vaultUnlock: (password: string, keyFilePath: string, vaultFilePath: string | null) => ipcRenderer.invoke('vault-unlock', password, keyFilePath, vaultFilePath),
  vaultLock: () => ipcRenderer.invoke('vault-lock'),
  vaultIsUnlocked: () => ipcRenderer.invoke('vault-is-unlocked'),
  vaultGetEntries: () => ipcRenderer.invoke('vault-get-entries'),
  vaultSaveEntry: (entry: any) => ipcRenderer.invoke('vault-save-entry', entry),
  vaultDeleteEntry: (id: string) => ipcRenderer.invoke('vault-delete-entry', id),
  vaultSelectKeyFile: () => ipcRenderer.invoke('vault-select-key-file'),
  vaultSelectVaultFile: () => ipcRenderer.invoke('vault-select-vault-file'),
  vaultExport: () => ipcRenderer.invoke('vault-export'),
  vaultImport: () => ipcRenderer.invoke('vault-import'),
  vaultGeneratePassword: (length: number, options: { uppercase: boolean; lowercase: boolean; digits: boolean; special: boolean }) => ipcRenderer.invoke('vault-generate-password', length, options),
  vaultImportCsv: () => ipcRenderer.invoke('vault-import-csv'),
  vaultExportCsv: () => ipcRenderer.invoke('vault-export-csv'),
  vaultChangePassword: (oldPassword: string, newPassword: string, keyFilePath: string) => ipcRenderer.invoke('vault-change-password', oldPassword, newPassword, keyFilePath),
  openVaultWindow: () => ipcRenderer.invoke('open-vault-window'),
  closeVaultWindow: () => ipcRenderer.invoke('close-vault-window'),
});
