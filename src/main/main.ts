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
  reminder?: string;
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
  updateTrayMenu();

  tray.on('double-click', () => {
    createMainWindow();
  });
}

function updateTrayMenu(): void {
  if (!tray) return;

  const notes = store.get('notes').filter((n: Note) => !n.deleted);
  const recent = [...notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const recentItems: Electron.MenuItemConstructorOptions[] = recent.length > 0
    ? [
        { type: 'separator' },
        { label: 'Ostatnie:', enabled: false },
        ...recent.map((n) => ({
          label: n.title.slice(0, 40),
          click: () => createNoteWindow(n.id),
        })),
        { type: 'separator' } as Electron.MenuItemConstructorOptions,
      ]
    : [{ type: 'separator' }];

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Otwórz notatki',
      click: () => createMainWindow(),
    },
    {
      label: 'Ostatnia notatka',
      click: () => showLastNote(),
    },
    ...recentItems,
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

  // Screenshot to note
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    takeScreenshot('note');
  });

  // Screenshot to clipboard
  globalShortcut.register('CommandOrControl+Shift+C', () => {
    takeScreenshot('clipboard');
  });
}

let screenshotMode: 'note' | 'clipboard' = 'note';

async function takeScreenshot(mode: 'note' | 'clipboard'): Promise<void> {
  screenshotMode = mode;
  const { desktopCapturer, screen: electronScreen } = require('electron');

  const display = electronScreen.getPrimaryDisplay();
  const { width, height } = display.size;
  const scaleFactor = display.scaleFactor;

  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width: width * scaleFactor, height: height * scaleFactor },
  });

  if (!sources.length) return;

  const fullScreenshot = sources[0].thumbnail.toDataURL();
  const modeLabel = mode === 'clipboard'
    ? 'Zaznacz obszar \u2192 kopiuj do schowka. ESC aby anulowa\u0107.'
    : 'Zaznacz obszar \u2192 nowa notatka. ESC aby anulowa\u0107.';

  const screenshotWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    fullscreen: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const htmlContent = `<!DOCTYPE html>
<html><head><style>
*{margin:0;padding:0}
body{overflow:hidden;cursor:crosshair;user-select:none}
#bg{position:fixed;top:0;left:0;width:100%;height:100%}
canvas{position:fixed;top:0;left:0;z-index:2}
.info{position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.75);color:#fff;padding:10px 20px;border-radius:10px;font-family:'Segoe UI',sans-serif;font-size:13px;z-index:3;backdrop-filter:blur(4px)}
</style></head><body>
<img id="bg" src="${fullScreenshot}"/>
<canvas id="canvas"></canvas>
<div class="info">${modeLabel}</div>
<script>
const{ipcRenderer}=require('electron');
const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
const bgImg=document.getElementById('bg');
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;
let startX=0,startY=0,isDrawing=false;
document.addEventListener('keydown',e=>{if(e.key==='Escape')ipcRenderer.send('screenshot-cancel')});
canvas.addEventListener('mousedown',e=>{startX=e.clientX;startY=e.clientY;isDrawing=true});
canvas.addEventListener('mousemove',e=>{
if(!isDrawing)return;
ctx.clearRect(0,0,canvas.width,canvas.height);
ctx.fillStyle='rgba(0,0,0,0.4)';
ctx.fillRect(0,0,canvas.width,canvas.height);
const x=Math.min(startX,e.clientX),y=Math.min(startY,e.clientY);
const w=Math.abs(e.clientX-startX),h=Math.abs(e.clientY-startY);
ctx.clearRect(x,y,w,h);
ctx.strokeStyle='#6366f1';ctx.lineWidth=2;ctx.setLineDash([6,3]);
ctx.strokeRect(x,y,w,h);ctx.setLineDash([]);
ctx.fillStyle='rgba(99,102,241,0.9)';ctx.fillRect(x,y-22,80,20);
ctx.fillStyle='#fff';ctx.font='11px Segoe UI';ctx.fillText(w+' x '+h,x+6,y-8);
});
canvas.addEventListener('mouseup',e=>{
if(!isDrawing)return;isDrawing=false;
const x=Math.min(startX,e.clientX),y=Math.min(startY,e.clientY);
const w=Math.abs(e.clientX-startX),h=Math.abs(e.clientY-startY);
if(w<10||h<10)return;
const scaleX=bgImg.naturalWidth/window.innerWidth;
const scaleY=bgImg.naturalHeight/window.innerHeight;
const crop=document.createElement('canvas');
crop.width=w*scaleX;crop.height=h*scaleY;
const cctx=crop.getContext('2d');
cctx.drawImage(bgImg,x*scaleX,y*scaleY,w*scaleX,h*scaleY,0,0,crop.width,crop.height);
ipcRenderer.send('screenshot-taken',crop.toDataURL('image/png'));
});
</script></body></html>`;

  screenshotWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
}

ipcMain.on('screenshot-cancel', () => {
  BrowserWindow.getAllWindows().forEach((win) => {
    if (win.isAlwaysOnTop() && win.isFullScreen()) {
      win.close();
    }
  });
});

ipcMain.on('screenshot-taken', (_event, dataUrl: string) => {
  // Close screenshot window
  BrowserWindow.getAllWindows().forEach((win) => {
    if (win.isAlwaysOnTop() && win.isFullScreen()) {
      win.close();
    }
  });

  if (screenshotMode === 'clipboard') {
    // Copy to clipboard
    const img = nativeImage.createFromDataURL(dataUrl);
    const { clipboard } = require('electron');
    clipboard.writeImage(img);
  } else {
    // Check if any note window is focused
    let pastedToExisting = false;
    for (const [, win] of noteWindows) {
      if (!win.isDestroyed() && win.isVisible()) {
        win.webContents.send('paste-screenshot', dataUrl);
        win.focus();
        pastedToExisting = true;
        break;
      }
    }

    if (!pastedToExisting) {
      // Create a new note with the screenshot
      const crypto = require('crypto');
      const newNote: Note = {
        id: crypto.randomUUID(),
        title: `Screenshot ${new Date().toLocaleString('pl-PL')}`,
        content: `<img src="${dataUrl}" />`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const notes = store.get('notes');
      notes.push(newNote);
      store.set('notes', notes);

      createNoteWindow(newNote.id);
      broadcastUpdate();
    }
  }
});

function broadcastUpdate(excludeSenderId?: number): void {
  const allWindows = BrowserWindow.getAllWindows();
  for (const win of allWindows) {
    if (!win.isDestroyed() && (!excludeSenderId || win.webContents.id !== excludeSenderId)) {
      win.webContents.send('notes-updated');
    }
  }
  updateTrayMenu();
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

ipcMain.handle('focus-main-window', () => {
  createMainWindow();
});

ipcMain.handle('set-theme', (_event, theme: string) => {
  const allWindows = BrowserWindow.getAllWindows();
  for (const win of allWindows) {
    if (!win.isDestroyed()) {
      win.webContents.send('theme-changed', theme);
    }
  }
});

ipcMain.handle('set-always-on-top', (_event, value: boolean) => {
  const senderWindow = BrowserWindow.fromWebContents(_event.sender);
  if (senderWindow && !senderWindow.isDestroyed()) {
    senderWindow.setAlwaysOnTop(value);
  }
});

ipcMain.handle('import-files', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Text files', extensions: ['md', 'txt', 'markdown'] },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) return;

  const notes = store.get('notes');
  const crypto = require('crypto');

  for (const filePath of result.filePaths) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath, path.extname(filePath));

    // Convert markdown-like content to basic HTML
    const htmlContent = content
      .split('\n')
      .map((line: string) => {
        if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`;
        if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
        if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
        if (line.startsWith('- [ ] ')) return `<li data-type="taskItem" data-checked="false"><p>${line.slice(6)}</p></li>`;
        if (line.startsWith('- [x] ')) return `<li data-type="taskItem" data-checked="true"><p>${line.slice(6)}</p></li>`;
        if (line.startsWith('- ')) return `<li><p>${line.slice(2)}</p></li>`;
        if (line.startsWith('> ')) return `<blockquote><p>${line.slice(2)}</p></blockquote>`;
        if (line.trim() === '') return '<p></p>';
        return `<p>${line}</p>`;
      })
      .join('');

    const newNote: Note = {
      id: crypto.randomUUID(),
      title: fileName,
      content: htmlContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    notes.push(newNote);
  }

  store.set('notes', notes);
  broadcastUpdate();
  return notes;
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

// Check reminders every minute
function checkReminders(): void {
  const notes = store.get('notes');
  const now = new Date();
  let changed = false;

  for (const note of notes) {
    if (note.reminder && !note.deleted) {
      const reminderDate = new Date(note.reminder);
      if (reminderDate <= now) {
        // Show notification
        const { Notification } = require('electron');
        const notification = new Notification({
          title: 'NoteIt – Przypomnienie',
          body: note.title,
          icon: getIconPath(),
          silent: false,
          urgency: 'critical' as any,
        });
        notification.on('click', () => {
          createNoteWindow(note.id);
        });
        notification.show();

        // Clear the reminder
        note.reminder = undefined;
        changed = true;
      }
    }
  }
  if (changed) {
    store.set('notes', notes);
    broadcastUpdate();
  }
}

// App lifecycle
app.on('ready', () => {
  createTray();
  registerShortcuts();
  cleanupTrash();
  checkReminders();
  setInterval(checkReminders, 60000); // Check every minute

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
