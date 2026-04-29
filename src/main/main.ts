import { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, nativeImage, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import Store from 'electron-store';

interface Note {
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

interface StoreSchema {
  notes: Note[];
}

const store = new Store<StoreSchema>({
  defaults: {
    notes: [],
  },
});

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;
const noteWindows = new Map<string, BrowserWindow>();

function getBaseUrl(): string {
  const isDev = !app.isPackaged;
  if (isDev) {
    return 'http://localhost:5173';
  }
  return `file://${path.join(__dirname, '../renderer/index.html')}`;
}

function createMainWindow(): void {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('show-all-notes');
    return;
  }

  mainWindow = new BrowserWindow({
    width: 960,
    height: 700,
    minWidth: 600,
    minHeight: 450,
    show: false,
    frame: true,
    autoHideMenuBar: true,
    titleBarStyle: 'default',
    icon: getIconPath(),
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const baseUrl = getBaseUrl();
  if (baseUrl.startsWith('http')) {
    mainWindow.loadURL(baseUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createNoteWindow(noteId: string, mode: string = 'editor'): void {
  const existing = noteWindows.get(noteId);
  if (existing && !existing.isDestroyed()) {
    existing.show();
    existing.focus();
    return;
  }

  const noteWindow = new BrowserWindow({
    width: 750,
    height: 650,
    minWidth: 500,
    minHeight: 400,
    show: false,
    frame: true,
    autoHideMenuBar: true,
    titleBarStyle: 'default',
    icon: getIconPath(),
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const baseUrl = getBaseUrl();
  const separator = baseUrl.includes('?') ? '&' : '?';
  const url = `${baseUrl}${separator}mode=${mode}&noteId=${noteId}`;

  if (baseUrl.startsWith('http')) {
    noteWindow.loadURL(url);
  } else {
    noteWindow.loadFile(path.join(__dirname, '../renderer/index.html'), {
      query: { mode, noteId },
    });
  }

  noteWindow.once('ready-to-show', () => {
    noteWindow.show();
  });

  noteWindow.on('closed', () => {
    noteWindows.delete(noteId);
  });

  noteWindows.set(noteId, noteWindow);
}

function showLastNote(): void {
  const notes = store.get('notes').filter((n: Note) => !n.deleted);
  if (notes.length === 0) {
    createMainWindow();
    return;
  }

  const sorted = [...notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  createNoteWindow(sorted[0].id, 'last');
}

function getIconPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'assets', 'noteit.ico');
  }
  return path.join(__dirname, '../../assets', 'noteit.ico');
}

function createTray(): void {
  const iconPath = getIconPath();
  let trayIcon: Electron.NativeImage;

  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      trayIcon = createDefaultIcon();
    }
  } catch {
    trayIcon = createDefaultIcon();
  }

  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Otwórz notatki',
      click: () => createMainWindow(),
    },
    {
      label: 'Ostatnia notatka',
      click: () => showLastNote(),
    },
    { type: 'separator' },
    {
      label: 'Zamknij NoteIt',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('NoteIt');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    createMainWindow();
  });
}

function createDefaultIcon(): Electron.NativeImage {
  const size = 16;
  const canvas = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    canvas[i * 4] = 99;
    canvas[i * 4 + 1] = 102;
    canvas[i * 4 + 2] = 241;
    canvas[i * 4 + 3] = 255;
  }
  return nativeImage.createFromBuffer(canvas, { width: size, height: size });
}

function registerShortcuts(): void {
  globalShortcut.register('CommandOrControl+Q', () => {
    createMainWindow();
  });

  globalShortcut.register('CommandOrControl+Shift+Q', () => {
    showLastNote();
  });
}

function broadcastUpdate(excludeSenderId?: number): void {
  const allWindows = BrowserWindow.getAllWindows();
  for (const win of allWindows) {
    if (!win.isDestroyed() && (!excludeSenderId || win.webContents.id !== excludeSenderId)) {
      win.webContents.send('notes-updated');
    }
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/blockquote>/gi, '\n')
    .replace(/<li>/gi, '- ')
    .replace(/<h1[^>]*>/gi, '# ')
    .replace(/<h2[^>]*>/gi, '## ')
    .replace(/<h3[^>]*>/gi, '### ')
    .replace(/<h4[^>]*>/gi, '#### ')
    .replace(/<h5[^>]*>/gi, '##### ')
    .replace(/<h6[^>]*>/gi, '###### ')
    .replace(/<blockquote[^>]*>/gi, '> ')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<hr\s*\/?>/gi, '\n---\n')
    .replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// IPC handlers
ipcMain.handle('get-notes', () => {
  return store.get('notes');
});

ipcMain.handle('save-note', (_event, note: Note) => {
  const notes = store.get('notes');
  const existingIndex = notes.findIndex((n: Note) => n.id === note.id);
  if (existingIndex >= 0) {
    notes[existingIndex] = note;
  } else {
    notes.push(note);
  }
  store.set('notes', notes);
  broadcastUpdate(_event.sender.id);
  return notes;
});

ipcMain.handle('delete-note', (_event, noteId: string) => {
  const notes = store.get('notes');
  const noteIndex = notes.findIndex((n: Note) => n.id === noteId);
  if (noteIndex >= 0) {
    notes[noteIndex].deleted = true;
    notes[noteIndex].deletedAt = new Date().toISOString();
  }
  store.set('notes', notes);

  const noteWindow = noteWindows.get(noteId);
  if (noteWindow && !noteWindow.isDestroyed()) {
    noteWindow.close();
  }

  broadcastUpdate(_event.sender.id);
  return notes;
});

ipcMain.handle('permanent-delete-note', (_event, noteId: string) => {
  const notes = store.get('notes').filter((n: Note) => n.id !== noteId);
  store.set('notes', notes);
  broadcastUpdate(_event.sender.id);
  return notes;
});

ipcMain.handle('restore-note', (_event, noteId: string) => {
  const notes = store.get('notes');
  const noteIndex = notes.findIndex((n: Note) => n.id === noteId);
  if (noteIndex >= 0) {
    notes[noteIndex].deleted = false;
    notes[noteIndex].deletedAt = undefined;
  }
  store.set('notes', notes);
  broadcastUpdate(_event.sender.id);
  return notes;
});

ipcMain.handle('save-image', async (_event, dataUrl: string) => {
  return dataUrl;
});

ipcMain.handle('open-note-window', (_event, noteId: string) => {
  createNoteWindow(noteId);
});

ipcMain.handle('set-theme', (_event, theme: string) => {
  const allWindows = BrowserWindow.getAllWindows();
  for (const win of allWindows) {
    if (!win.isDestroyed()) {
      win.webContents.send('theme-changed', theme);
    }
  }
});

ipcMain.handle('export-note', async (_event, noteId: string, format: string) => {
  const notes = store.get('notes');
  const note = notes.find((n: Note) => n.id === noteId);
  if (!note) return;

  const filters = format === 'md'
    ? [{ name: 'Markdown', extensions: ['md'] }]
    : [{ name: 'Text', extensions: ['txt'] }];

  const result = await dialog.showSaveDialog({
    defaultPath: `${note.title}.${format}`,
    filters,
  });

  if (!result.canceled && result.filePath) {
    let content = '';
    if (format === 'md') {
      content = `# ${note.title}\n\n${stripHtml(note.content)}`;
    } else {
      content = `${note.title}\n\n${stripHtml(note.content)}`;
    }
    fs.writeFileSync(result.filePath, content, 'utf-8');
  }
});

// Clean up notes deleted more than 30 days ago
function cleanupTrash(): void {
  const notes = store.get('notes');
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const cleaned = notes.filter((n: Note) => {
    if (!n.deleted || !n.deletedAt) return true;
    return new Date(n.deletedAt) > thirtyDaysAgo;
  });

  if (cleaned.length !== notes.length) {
    store.set('notes', cleaned);
  }
}

// App lifecycle
app.on('ready', () => {
  createTray();
  registerShortcuts();
  cleanupTrash();

  app.setLoginItemSettings({
    openAtLogin: true,
    path: app.getPath('exe'),
  });
});

app.on('window-all-closed', () => {
  // Stay in tray
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  createMainWindow();
});
