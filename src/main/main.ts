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
  kanbanStatus?: 'todo' | 'inprogress' | 'done';
  parentId?: string;
  childrenOrder?: string[];
  locked?: boolean;
  lockHash?: string;
}

interface StoreSchema {
  notes: Note[];
}

const store = new Store<StoreSchema>({
  defaults: {
    notes: [],
  },
});

// Migration: ensure all notes have parentId and childrenOrder fields
function migrateNotes(): void {
  const notes = store.get('notes');
  let changed = false;
  for (const note of notes) {
    if (note.parentId === undefined) {
      note.parentId = undefined;
      changed = true;
    }
    if (note.childrenOrder === undefined) {
      note.childrenOrder = [];
      changed = true;
    }
  }
  if (changed) {
    store.set('notes', notes);
  }
}
migrateNotes();

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
    frame: false,
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
    frame: false,
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
        if (pomodoroIsRunning) {
          const choice = dialog.showMessageBoxSync({
            type: 'question',
            buttons: ['Anuluj', 'Zamknij'],
            defaultId: 0,
            title: 'NoteIt',
            message: 'Pomodoro jest aktywne. Zamknac NoteIt?',
          });
          if (choice === 0) return;
        }
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

  // Paste clipboard as new note
  globalShortcut.register('CommandOrControl+Shift+V', () => {
    pasteClipboardAsNote();
  });
}

function pasteClipboardAsNote(): void {
  const { clipboard } = require('electron');
  const text = clipboard.readText();
  if (!text || !text.trim()) return;

  const crypto = require('crypto');
  const title = text.trim().slice(0, 50).split('\n')[0];
  const newNote: Note = {
    id: crypto.randomUUID(),
    title: title,
    content: `<p>${text.replace(/\n/g, '</p><p>')}</p>`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const notes = store.get('notes');
  notes.push(newNote);
  store.set('notes', notes);

  createNoteWindow(newNote.id);
  broadcastUpdate();
}

let screenshotMode: 'note' | 'clipboard' = 'note';
let screenshotWindow: BrowserWindow | null = null;

async function takeScreenshot(mode: 'note' | 'clipboard'): Promise<void> {
  screenshotMode = mode;
  const { screen: electronScreen } = require('electron');

  const display = electronScreen.getPrimaryDisplay();
  const { width, height } = display.workAreaSize;
  const scaleFactor = display.scaleFactor;

  // Capture screen using PowerShell (reliable on Windows)
  const tempPath = path.join(app.getPath('temp'), 'noteit-screenshot.png');
  const { execSync } = require('child_process');
  const workX = display.workArea.x;
  const workY = display.workArea.y;
  const capW = width * scaleFactor;
  const capH = height * scaleFactor;

  try {
    execSync(`powershell -command "Add-Type -AssemblyName System.Drawing; $bmp = New-Object System.Drawing.Bitmap(${capW}, ${capH}); $g = [System.Drawing.Graphics]::FromImage($bmp); $g.CopyFromScreen(${workX * scaleFactor}, ${workY * scaleFactor}, 0, 0, [System.Drawing.Size]::new(${capW}, ${capH})); $bmp.Save('${tempPath.replace(/\\/g, '\\\\')}'); $g.Dispose(); $bmp.Dispose()"`, { timeout: 5000, windowsHide: true });
  } catch { return; }

  const modeLabel = 'Zaznacz obszar. ESC aby anulowac.';

  // Open window covering work area (without taskbar)
  const screenshotWin = new BrowserWindow({
    width,
    height,
    x: display.workArea.x,
    y: display.workArea.y,
    frame: false,
    show: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    focusable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const htmlContent = `<!DOCTYPE html>
<html><head><style>
*{margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden}
body{cursor:crosshair;user-select:none;position:relative}
#bg{position:absolute;top:0;left:0;width:100%;height:100%;z-index:0}
canvas{position:absolute;top:0;left:0;width:100%;height:100%;z-index:1}
.info{position:fixed;top:16px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.75);color:#fff;padding:8px 18px;border-radius:8px;font-family:'Segoe UI',sans-serif;font-size:12px;z-index:3}
</style></head><body>
<img id="bg"/>
<canvas id="canvas"></canvas>
<div class="info">${modeLabel}</div>
<script>
const{ipcRenderer}=require('electron');
const fs=require('fs');
const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
const bgImg=document.getElementById('bg');

const imgBuffer=fs.readFileSync('${tempPath.replace(/\\/g, '\\\\')}');
const blob=new Blob([imgBuffer],{type:'image/png'});
bgImg.src=URL.createObjectURL(blob);

bgImg.onload=()=>{
  canvas.width=bgImg.clientWidth;
  canvas.height=bgImg.clientHeight;
  ctx.fillStyle='rgba(0,0,0,0.15)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
};

let startX=0,startY=0,isDrawing=false;

document.addEventListener('keydown',e=>{if(e.key==='Escape')ipcRenderer.send('screenshot-cancel')});

canvas.addEventListener('mousedown',e=>{startX=e.clientX;startY=e.clientY;isDrawing=true});

canvas.addEventListener('mousemove',e=>{
  if(!isDrawing)return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const x=Math.min(startX,e.clientX),y=Math.min(startY,e.clientY);
  const w=Math.abs(e.clientX-startX),h=Math.abs(e.clientY-startY);
  // Dark overlay outside selection
  ctx.fillStyle='rgba(0,0,0,0.4)';
  ctx.fillRect(0,0,canvas.width,y);
  ctx.fillRect(0,y+h,canvas.width,canvas.height-y-h);
  ctx.fillRect(0,y,x,h);
  ctx.fillRect(x+w,y,canvas.width-x-w,h);
  // Border
  ctx.strokeStyle='#6366f1';ctx.lineWidth=2;ctx.setLineDash([5,3]);
  ctx.strokeRect(x,y,w,h);ctx.setLineDash([]);
  // Size
  if(y>24){ctx.fillStyle='rgba(99,102,241,0.85)';ctx.fillRect(x,y-20,72,18);ctx.fillStyle='#fff';ctx.font='11px Segoe UI';ctx.fillText(w+' x '+h,x+5,y-6);}
});

canvas.addEventListener('mouseup',e=>{
  if(!isDrawing)return;isDrawing=false;
  const x=Math.min(startX,e.clientX),y=Math.min(startY,e.clientY);
  const w=Math.abs(e.clientX-startX),h=Math.abs(e.clientY-startY);
  if(w<10||h<10){ipcRenderer.send('screenshot-cancel');return;}
  const scaleX=bgImg.naturalWidth/bgImg.clientWidth;
  const scaleY=bgImg.naturalHeight/bgImg.clientHeight;
  const crop=document.createElement('canvas');
  crop.width=Math.round(w*scaleX);crop.height=Math.round(h*scaleY);
  const cctx=crop.getContext('2d');
  cctx.drawImage(bgImg,Math.round(x*scaleX),Math.round(y*scaleY),crop.width,crop.height,0,0,crop.width,crop.height);
  ipcRenderer.send('screenshot-taken',crop.toDataURL('image/png'));
});
</script></body></html>`;

  screenshotWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
  screenshotWin.once('ready-to-show', () => {
    screenshotWin.show();
    screenshotWin.focus();
    globalShortcut.register('Escape', () => {
      if (screenshotWindow && !screenshotWindow.isDestroyed()) {
        screenshotWindow.close();
        screenshotWindow = null;
      }
      try { globalShortcut.unregister('Escape'); } catch {}
    });
  });
  screenshotWin.on('closed', () => {
    screenshotWindow = null;
    try { globalShortcut.unregister('Escape'); } catch {}
  });
  screenshotWindow = screenshotWin;
}

ipcMain.on('screenshot-cancel', () => {
  if (screenshotWindow && !screenshotWindow.isDestroyed()) {
    screenshotWindow.close();
    screenshotWindow = null;
  }
});

ipcMain.on('screenshot-taken', (_event, dataUrl: string) => {
  if (screenshotWindow && !screenshotWindow.isDestroyed()) {
    screenshotWindow.close();
    screenshotWindow = null;
  }

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

ipcMain.handle('window-action', (_event, action: string) => {
  const win = BrowserWindow.fromWebContents(_event.sender);
  if (!win || win.isDestroyed()) return;
  switch (action) {
    case 'minimize': win.minimize(); break;
    case 'maximize': win.isMaximized() ? win.unmaximize() : win.maximize(); break;
    case 'close': win.close(); break;
  }
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

ipcMain.handle('open-sticky-note', (_event, noteId: string) => {
  const notes = store.get('notes');
  const note = notes.find((n: Note) => n.id === noteId);
  if (!note) return;

  const stickyWin = new BrowserWindow({
    width: 300,
    height: 240,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: true,
    minimizable: false,
    maximizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Write note data to temp file to avoid escaping issues
  const tempDataPath = path.join(app.getPath('temp'), 'noteit-sticky-data.json');
  fs.writeFileSync(tempDataPath, JSON.stringify({ title: note.title, content: note.content }), 'utf-8');

  const html = `<!DOCTYPE html>
<html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter','Segoe UI',sans-serif;height:100vh;display:flex;flex-direction:column;overflow:hidden;border-radius:8px}
:root{--bg:#fffbeb;--bg-header:#fef3c7;--text:#292524;--text-sec:#57534e;--border:#f5e6b8}
@media(prefers-color-scheme:dark){:root{--bg:#292524;--bg-header:#44403c;--text:#fafaf9;--text-sec:#d6d3d1;--border:#57534e}}
body{background:var(--bg);color:var(--text)}
.header{display:flex;align-items:center;padding:8px 12px;background:var(--bg-header);border-bottom:1px solid var(--border);-webkit-app-region:drag;cursor:grab;gap:8px;flex-shrink:0}
.title{font-size:12px;font-weight:600;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-0.01em}
.header-btn{-webkit-app-region:no-drag;background:none;border:none;cursor:pointer;color:var(--text-sec);width:20px;height:20px;display:flex;align-items:center;justify-content:center;border-radius:4px;transition:background 0.15s}
.header-btn:hover{background:rgba(0,0,0,0.08)}
.close-btn:hover{background:#e81123;color:#fff}
.content{flex:1;padding:12px 14px;font-size:13px;line-height:1.7;color:var(--text-sec);overflow-y:auto;letter-spacing:-0.01em}
.content p{margin-bottom:0.4em}
.content h1,.content h2,.content h3{color:var(--text);margin-bottom:0.3em}
.content h1{font-size:1.2em}
.content h2{font-size:1.1em}
.content h3{font-size:1em}
.content ul,.content ol{padding-left:1.2em;margin-bottom:0.4em}
.content li{margin-bottom:0.2em}
.content blockquote{border-left:3px solid var(--border);padding-left:8px;color:var(--text-sec);font-style:italic;margin-bottom:0.4em}
.content code{background:rgba(0,0,0,0.06);padding:1px 4px;border-radius:3px;font-size:0.9em;font-family:'Cascadia Code',monospace}
.content table{width:100%;border-collapse:collapse;margin:0.4em 0;font-size:0.85em}
.content th,.content td{border:1px solid var(--border);padding:4px 6px;text-align:left}
.content th{background:var(--bg-header);font-weight:600;font-size:0.8em}
.content img{max-width:100%;border-radius:4px;margin:4px 0}
.content hr{border:none;border-top:1px solid var(--border);margin:0.5em 0}
.content a{color:#6366f1;text-decoration:none}
.content mark{border-radius:2px;padding:0 2px}
ul[data-type="taskList"]{list-style:none;padding-left:0}
ul[data-type="taskList"] li{display:flex;align-items:baseline;gap:6px}
</style></head><body>
<div class="header">
  <span class="title" id="title"></span>
  <button class="header-btn close-btn" onclick="window.close()" title="Zamknij">
    <svg width="10" height="10" viewBox="0 0 12 12"><line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" stroke-width="1.5"/><line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" stroke-width="1.5"/></svg>
  </button>
</div>
<div class="content" id="content"></div>
<script>
const fs=require('fs');
const data=JSON.parse(fs.readFileSync('${tempDataPath.replace(/\\/g, '\\\\')}','utf-8'));
document.getElementById('title').textContent=data.title;
document.getElementById('content').innerHTML=data.content;
</script>
</body></html>`;

  stickyWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
});

ipcMain.handle('focus-main-window', () => {
  createMainWindow();
});

ipcMain.handle('move-note-to-parent', (_event, noteId: string, newParentId: string | null) => {
  const notes = store.get('notes');
  const note = notes.find((n: Note) => n.id === noteId);
  if (!note) return notes;

  // Remove from old parent's childrenOrder
  if (note.parentId) {
    const oldParent = notes.find((n: Note) => n.id === note.parentId);
    if (oldParent && oldParent.childrenOrder) {
      oldParent.childrenOrder = oldParent.childrenOrder.filter((id: string) => id !== noteId);
    }
  }

  // Set new parent
  note.parentId = newParentId || undefined;

  // Add to new parent's childrenOrder
  if (newParentId) {
    const newParent = notes.find((n: Note) => n.id === newParentId);
    if (newParent) {
      if (!newParent.childrenOrder) newParent.childrenOrder = [];
      if (!newParent.childrenOrder.includes(noteId)) {
        newParent.childrenOrder.push(noteId);
      }
    }
  }

  store.set('notes', notes);
  broadcastUpdate(_event.sender.id);
  return notes;
});

ipcMain.handle('create-child-note', (_event, parentId: string, title: string) => {
  const notes = store.get('notes');
  const parent = notes.find((n: Note) => n.id === parentId);
  if (!parent) return notes;

  const crypto = require('crypto');
  const newNote: Note = {
    id: crypto.randomUUID(),
    title,
    content: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parentId,
    childrenOrder: [],
  };

  notes.push(newNote);

  if (!parent.childrenOrder) parent.childrenOrder = [];
  parent.childrenOrder.push(newNote.id);

  store.set('notes', notes);
  broadcastUpdate(_event.sender.id);
  return newNote.id;
});

ipcMain.handle('set-theme', (_event, theme: string) => {
  const allWindows = BrowserWindow.getAllWindows();
  for (const win of allWindows) {
    if (!win.isDestroyed()) {
      win.webContents.send('theme-changed', theme);
    }
  }
});

ipcMain.handle('set-pomodoro-running', (_event, running: boolean) => {
  pomodoroIsRunning = running;
});

ipcMain.handle('set-auto-start', (_event, value: boolean) => {
  app.setLoginItemSettings({
    openAtLogin: value,
    path: app.getPath('exe'),
  });
});

ipcMain.handle('get-auto-start', () => {
  const settings = app.getLoginItemSettings();
  return settings.openAtLogin;
});

ipcMain.handle('set-show-on-start', (_event, value: boolean) => {
  store.set('showOnStart' as any, value);
});

ipcMain.handle('lock-note', (_event, noteId: string, pin: string) => {
  const notes = store.get('notes');
  const note = notes.find((n: Note) => n.id === noteId);
  if (!note) return false;
  // Simple hash (not cryptographically secure, but good enough for local PIN)
  const crypto = require('crypto');
  note.lockHash = crypto.createHash('sha256').update(pin).digest('hex');
  note.locked = true;
  store.set('notes', notes);
  broadcastUpdate(_event.sender.id);
  return true;
});

ipcMain.handle('unlock-note', (_event, noteId: string, pin: string) => {
  const notes = store.get('notes');
  const note = notes.find((n: Note) => n.id === noteId);
  if (!note || !note.lockHash) return false;
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(pin).digest('hex');
  return hash === note.lockHash;
});

ipcMain.handle('remove-lock', (_event, noteId: string) => {
  const notes = store.get('notes');
  const note = notes.find((n: Note) => n.id === noteId);
  if (!note) return;
  note.locked = false;
  note.lockHash = undefined;
  store.set('notes', notes);
  broadcastUpdate(_event.sender.id);
});

ipcMain.handle('set-always-on-top', (_event, value: boolean) => {
  const senderWindow = BrowserWindow.fromWebContents(_event.sender);
  if (senderWindow && !senderWindow.isDestroyed()) {
    senderWindow.setAlwaysOnTop(value);
  }
});

ipcMain.handle('open-external', (_event, url: string) => {
  const { shell } = require('electron');
  shell.openExternal(url);
});

let pomodoroMiniWindow: BrowserWindow | null = null;
let pomodoroIsRunning = false;

ipcMain.handle('open-pomodoro-mini', (_event, mode: string, timeLeft: number, isRunning: boolean) => {
  if (pomodoroMiniWindow && !pomodoroMiniWindow.isDestroyed()) {
    pomodoroMiniWindow.focus();
    return;
  }

  pomodoroMiniWindow = new BrowserWindow({
    width: 190,
    height: 40,
    x: Math.round(require('electron').screen.getPrimaryDisplay().workAreaSize.width - 210),
    y: 20,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  pomodoroMiniWindow.setVisibleOnAllWorkspaces(true);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const html = `<!DOCTYPE html>
<html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:transparent}
body{font-family:'Segoe UI',sans-serif;-webkit-app-region:drag;display:flex;align-items:center;justify-content:center}
.pill{display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:20px;border:1px solid rgba(128,128,128,0.2);backdrop-filter:blur(12px)}
.pill.light{background:rgba(255,255,255,0.92);color:#1a1a2e}
.pill.dark{background:rgba(30,30,42,0.92);color:#f0f0f5}
.mode{width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#fff}
.mode.work{background:#6366f1}
.mode.break{background:#10b981}
.time{font-size:13px;font-weight:700;font-variant-numeric:tabular-nums;min-width:40px}
button{-webkit-app-region:no-drag;background:none;border:none;cursor:pointer;padding:3px;border-radius:4px;display:flex;align-items:center}
.light button{color:rgba(0,0,0,0.5)}
.dark button{color:rgba(255,255,255,0.6)}
button:hover{background:rgba(128,128,128,0.15)}
</style></head><body>
<div class="pill dark" id="pill">
  <span class="mode ${mode}" id="mode">${mode === 'work' ? 'P' : 'O'}</span>
  <span class="time" id="time">${formatTime(timeLeft)}</span>
  <button id="toggle">
    ${isRunning ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>' : '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>'}
  </button>
  <button id="expand">
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/></svg>
  </button>
  <button id="close">
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  </button>
</div>
<script>
const{ipcRenderer}=require('electron');
document.getElementById('toggle').addEventListener('click',()=>ipcRenderer.send('pomodoro-mini-action','toggle'));
document.getElementById('expand').addEventListener('click',()=>ipcRenderer.send('pomodoro-mini-action','expand'));
document.getElementById('close').addEventListener('click',()=>ipcRenderer.send('pomodoro-mini-action','close'));
ipcRenderer.on('pomodoro-mini-update',(e,data)=>{
  document.getElementById('time').textContent=data.time;
  const modeEl=document.getElementById('mode');
  modeEl.className='mode '+data.mode;
  modeEl.textContent=data.mode==='work'?'P':'O';
  const btn=document.getElementById('toggle');
  btn.innerHTML=data.isRunning?'<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>':'<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>';
  const pill=document.getElementById('pill');
  pill.className='pill '+(data.theme||'dark');
});
</script></body></html>`;

  pomodoroMiniWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

  pomodoroMiniWindow.on('closed', () => {
    pomodoroMiniWindow = null;
  });
});

ipcMain.handle('close-pomodoro-mini', () => {
  if (pomodoroMiniWindow && !pomodoroMiniWindow.isDestroyed()) {
    pomodoroMiniWindow.close();
    pomodoroMiniWindow = null;
  }
});

ipcMain.handle('update-pomodoro-mini', (_event, mode: string, timeLeft: number, isRunning: boolean, theme: string) => {
  pomodoroIsRunning = isRunning;
  if (pomodoroMiniWindow && !pomodoroMiniWindow.isDestroyed()) {
    const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    pomodoroMiniWindow.webContents.send('pomodoro-mini-update', {
      mode,
      time: formatTime(timeLeft),
      isRunning,
      theme: theme || 'dark',
    });
  }
});

ipcMain.on('confirm-quit', (_event, canQuit: boolean) => {
  if (canQuit) {
    isQuitting = true;
    app.quit();
  }
  // If !canQuit, user cancelled - do nothing
});

ipcMain.on('force-quit', () => {
  isQuitting = true;
  app.quit();
});

ipcMain.on('pomodoro-mini-action', (_event, action: string) => {
  // Forward action to main renderer window
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('pomodoro-action', action);
  }
  // Also send to all note windows
  for (const [, win] of noteWindows) {
    if (!win.isDestroyed()) {
      win.webContents.send('pomodoro-action', action);
    }
  }
  if (action === 'close') {
    if (pomodoroMiniWindow && !pomodoroMiniWindow.isDestroyed()) {
      pomodoroMiniWindow.close();
      pomodoroMiniWindow = null;
    }
  }
});

ipcMain.handle('import-files', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'All supported', extensions: ['md', 'txt', 'markdown', 'zip'] },
      { name: 'Text files', extensions: ['md', 'txt', 'markdown'] },
      { name: 'ZIP archive', extensions: ['zip'] },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) return;

  const notes = store.get('notes');
  const crypto = require('crypto');

  function mdToHtml(content: string): string {
    return content
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
  }

  function importTextFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath, path.extname(filePath));
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: fileName,
      content: mdToHtml(content),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    notes.push(newNote);
  }

  function parseZipFile(zipPath: string) {
    const zipBuffer = fs.readFileSync(zipPath);
    // Parse ZIP central directory
    let offset = zipBuffer.length - 22;
    while (offset >= 0 && zipBuffer.readUInt32LE(offset) !== 0x06054b50) {
      offset--;
    }
    if (offset < 0) return;

    const centralDirOffset = zipBuffer.readUInt32LE(offset + 16);
    const entryCount = zipBuffer.readUInt16LE(offset + 10);
    let pos = centralDirOffset;

    // First pass: check if noteit-metadata.json exists
    const extractedFiles: { name: string; data: Buffer }[] = [];

    for (let i = 0; i < entryCount; i++) {
      if (zipBuffer.readUInt32LE(pos) !== 0x02014b50) break;

      const uncompressedSize = zipBuffer.readUInt32LE(pos + 24);
      const fileNameLen = zipBuffer.readUInt16LE(pos + 28);
      const extraLen = zipBuffer.readUInt16LE(pos + 30);
      const commentLen = zipBuffer.readUInt16LE(pos + 32);
      const localHeaderOffset = zipBuffer.readUInt32LE(pos + 42);
      const fileName = zipBuffer.slice(pos + 46, pos + 46 + fileNameLen).toString('utf-8');

      const localNameLen = zipBuffer.readUInt16LE(localHeaderOffset + 26);
      const localExtraLen = zipBuffer.readUInt16LE(localHeaderOffset + 28);
      const dataOffset = localHeaderOffset + 30 + localNameLen + localExtraLen;
      const fileData = zipBuffer.slice(dataOffset, dataOffset + uncompressedSize);

      extractedFiles.push({ name: fileName, data: fileData });
      pos += 46 + fileNameLen + extraLen + commentLen;
    }

    // Check for metadata file (NoteIt export format)
    const metadataFile = extractedFiles.find((f) => f.name === 'noteit-metadata.json');
    if (metadataFile) {
      // Import with full metadata
      const metadata = JSON.parse(metadataFile.data.toString('utf-8'));
      for (const noteMeta of metadata) {
        const newNote: Note = {
          id: crypto.randomUUID(), // New ID to avoid conflicts
          title: noteMeta.title || 'Imported',
          content: noteMeta.content || '',
          createdAt: noteMeta.createdAt || new Date().toISOString(),
          updatedAt: noteMeta.updatedAt || new Date().toISOString(),
          pinned: noteMeta.pinned,
          tags: noteMeta.tags,
          color: noteMeta.color,
          reminder: noteMeta.reminder,
          kanbanStatus: noteMeta.kanbanStatus,
          parentId: undefined, // Don't import hierarchy (IDs changed)
          childrenOrder: [],
          locked: noteMeta.locked,
          lockHash: noteMeta.lockHash,
        };
        notes.push(newNote);
      }
    } else {
      // Fallback: import .md/.txt files as plain notes
      for (const file of extractedFiles) {
        if (file.name.endsWith('.md') || file.name.endsWith('.txt') || file.name.endsWith('.markdown')) {
          const content = file.data.toString('utf-8');
          const baseName = path.basename(file.name, path.extname(file.name));
          const newNote: Note = {
            id: crypto.randomUUID(),
            title: baseName,
            content: mdToHtml(content),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          notes.push(newNote);
        }
      }
    }
  }

  for (const filePath of result.filePaths) {
    if (filePath.endsWith('.zip')) {
      parseZipFile(filePath);
    } else {
      importTextFile(filePath);
    }
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

ipcMain.handle('export-zip', async (_event, noteIds: string[]) => {
  const notes = store.get('notes');
  const selectedNotes = notes.filter((n: Note) => noteIds.includes(n.id));
  if (selectedNotes.length === 0) return;

  const result = await dialog.showSaveDialog({
    defaultPath: `noteit-export-${new Date().toISOString().slice(0, 10)}.zip`,
    filters: [{ name: 'ZIP', extensions: ['zip'] }],
  });

  if (result.canceled || !result.filePath) return;

  // Include metadata.json with full note data + individual .md files
  const files: { name: string; content: Buffer }[] = [];

  // Add metadata.json with all note data (for re-import)
  const metadata = selectedNotes.map((note) => ({
    id: note.id,
    title: note.title,
    content: note.content,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    pinned: note.pinned,
    tags: note.tags,
    color: note.color,
    reminder: note.reminder,
    kanbanStatus: note.kanbanStatus,
    parentId: note.parentId,
    childrenOrder: note.childrenOrder,
    locked: note.locked,
    lockHash: note.lockHash,
  }));
  files.push({
    name: 'noteit-metadata.json',
    content: Buffer.from(JSON.stringify(metadata, null, 2), 'utf-8'),
  });

  // Add readable .md files
  for (const note of selectedNotes) {
    files.push({
      name: `${note.title.replace(/[<>:"/\\|?*]/g, '_')}.md`,
      content: Buffer.from(`# ${note.title}\n\n${stripHtml(note.content)}`, 'utf-8'),
    });
  }

  const archiver = createSimpleZipFromFiles(files);
  fs.writeFileSync(result.filePath, archiver);
});

function createSimpleZipFromFiles(files: { name: string; content: Buffer }[]): Buffer {

  // Minimal ZIP file format
  const localHeaders: Buffer[] = [];
  const centralHeaders: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBuffer = Buffer.from(file.name, 'utf-8');
    const localHeader = Buffer.alloc(30 + nameBuffer.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // Local file header signature
    localHeader.writeUInt16LE(20, 4); // Version needed
    localHeader.writeUInt16LE(0, 6); // Flags
    localHeader.writeUInt16LE(0, 8); // Compression (none)
    localHeader.writeUInt16LE(0, 10); // Mod time
    localHeader.writeUInt16LE(0, 12); // Mod date
    localHeader.writeUInt32LE(0, 14); // CRC-32 (skip for simplicity)
    localHeader.writeUInt32LE(file.content.length, 18); // Compressed size
    localHeader.writeUInt32LE(file.content.length, 22); // Uncompressed size
    localHeader.writeUInt16LE(nameBuffer.length, 26); // File name length
    localHeader.writeUInt16LE(0, 28); // Extra field length
    nameBuffer.copy(localHeader, 30);

    localHeaders.push(Buffer.concat([localHeader, file.content]));

    // Central directory header
    const centralHeader = Buffer.alloc(46 + nameBuffer.length);
    centralHeader.writeUInt32LE(0x02014b50, 0); // Central directory signature
    centralHeader.writeUInt16LE(20, 4); // Version made by
    centralHeader.writeUInt16LE(20, 6); // Version needed
    centralHeader.writeUInt16LE(0, 8); // Flags
    centralHeader.writeUInt16LE(0, 10); // Compression
    centralHeader.writeUInt16LE(0, 12); // Mod time
    centralHeader.writeUInt16LE(0, 14); // Mod date
    centralHeader.writeUInt32LE(0, 16); // CRC-32
    centralHeader.writeUInt32LE(file.content.length, 20); // Compressed size
    centralHeader.writeUInt32LE(file.content.length, 24); // Uncompressed size
    centralHeader.writeUInt16LE(nameBuffer.length, 28); // File name length
    centralHeader.writeUInt16LE(0, 30); // Extra field length
    centralHeader.writeUInt16LE(0, 32); // Comment length
    centralHeader.writeUInt16LE(0, 34); // Disk number start
    centralHeader.writeUInt16LE(0, 36); // Internal attributes
    centralHeader.writeUInt32LE(0, 38); // External attributes
    centralHeader.writeUInt32LE(offset, 42); // Relative offset
    nameBuffer.copy(centralHeader, 46);

    centralHeaders.push(centralHeader);
    offset += localHeader.length + file.content.length;
  }

  const centralDirBuffer = Buffer.concat(centralHeaders);
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0); // End of central directory signature
  endRecord.writeUInt16LE(0, 4); // Disk number
  endRecord.writeUInt16LE(0, 6); // Central dir disk
  endRecord.writeUInt16LE(files.length, 8); // Entries on disk
  endRecord.writeUInt16LE(files.length, 10); // Total entries
  endRecord.writeUInt32LE(centralDirBuffer.length, 12); // Central dir size
  endRecord.writeUInt32LE(offset, 16); // Central dir offset
  endRecord.writeUInt16LE(0, 20); // Comment length

  return Buffer.concat([...localHeaders, centralDirBuffer, endRecord]);
}

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

// Check for updates
async function checkForUpdates(): Promise<void> {
  try {
    const showOnStartVal = store.get('checkUpdates' as any);
    if (showOnStartVal === false) return;

    const https = require('https');
    const options = {
      hostname: 'api.github.com',
      path: '/repos/tiwanowski96/NoteIt/releases/latest',
      headers: { 'User-Agent': 'NoteIt' }
    };

    const data = await new Promise<string>((resolve, reject) => {
      https.get(options, (res: any) => {
        let body = '';
        res.on('data', (chunk: string) => body += chunk);
        res.on('end', () => resolve(body));
      }).on('error', reject);
    });

    const release = JSON.parse(data);
    const latestVersion = release.tag_name?.replace('v', '') || '';
    const currentVersion = require('../../package.json').version;

    if (latestVersion && latestVersion !== currentVersion && compareVersions(latestVersion, currentVersion) > 0) {
      const allWindows = BrowserWindow.getAllWindows();
      for (const win of allWindows) {
        if (!win.isDestroyed()) {
          win.webContents.send('update-available', {
            version: latestVersion,
            url: release.html_url,
          });
        }
      }
    }
  } catch {}
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }
  return 0;
}

ipcMain.handle('set-check-updates', (_event, value: boolean) => {
  store.set('checkUpdates' as any, value);
});

ipcMain.handle('get-check-updates', () => {
  const val = store.get('checkUpdates' as any);
  return val === undefined ? true : val;
});

// File open handling
let pendingFilePath: string | null = null;

function handleFileOpen(filePath: string): void {
  if (!filePath || (!filePath.endsWith('.txt') && !filePath.endsWith('.md') && !filePath.endsWith('.markdown'))) return;

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath, path.extname(filePath));
    const crypto = require('crypto');

    function mdToHtmlSimple(text: string): string {
      return text
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
    }

    const newNote: Note = {
      id: crypto.randomUUID(),
      title: fileName,
      content: mdToHtmlSimple(content),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const notes = store.get('notes');
    notes.push(newNote);
    store.set('notes', notes);

    createNoteWindow(newNote.id);
    broadcastUpdate();
  } catch {}
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, commandLine) => {
    // Someone tried to open a file while app is already running
    const filePath = commandLine.find((arg) => arg.endsWith('.txt') || arg.endsWith('.md') || arg.endsWith('.markdown'));
    if (filePath) {
      handleFileOpen(filePath);
    } else {
      createMainWindow();
    }
  });
}

// App lifecycle
app.on('ready', () => {
  // Show splash screen
  const { screen: electronScreen } = require('electron');
  const display = electronScreen.getPrimaryDisplay();
  const { width, height } = display.workAreaSize;

  const splashWindow = new BrowserWindow({
    width: 400,
    height: 250,
    x: Math.round((width - 400) / 2),
    y: Math.round((height - 250) / 2),
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load logo as base64 for splash
  const logoPath = path.join(__dirname, '../../assets', 'noteit_sign.png');
  let logoBase64 = '';
  try {
    logoBase64 = fs.readFileSync(logoPath).toString('base64');
  } catch {}

  const splashHtml = `<!DOCTYPE html>
<html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:transparent}
body{display:flex;align-items:center;justify-content:center;font-family:'Segoe UI','Inter',sans-serif}
.splash{width:100%;height:100%;border-radius:16px;background:#ffffff;border:3px solid transparent;background-clip:padding-box;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;box-shadow:0 20px 60px rgba(99,102,241,0.2)}
.splash::before{content:'';position:absolute;inset:-3px;border-radius:18px;background:linear-gradient(135deg,#6366f1,#8b5cf6,#6366f1);z-index:-1}
.logo img{height:52px;width:auto}
.loader{display:flex;gap:6px;margin-top:8px}
.loader span{width:8px;height:8px;border-radius:50%;background:#6366f1;animation:pulse 1.2s ease-in-out infinite}
.loader span:nth-child(2){animation-delay:0.2s}
.loader span:nth-child(3){animation-delay:0.4s}
@keyframes pulse{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}
</style></head><body>
<div class="splash">
  <div class="logo"><img src="data:image/png;base64,${logoBase64}" alt="NoteIt"/></div>
  <div class="loader"><span></span><span></span><span></span></div>
</div>
</body></html>`;

  splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHtml)}`);
  splashWindow.once('ready-to-show', () => {
    splashWindow.show();
  });

  setTimeout(() => {
    if (!splashWindow.isDestroyed()) {
      splashWindow.close();
    }
    createTray();
    registerShortcuts();
    cleanupTrash();
    checkReminders();
    setInterval(checkReminders, 60000);

    // Handle file opened via command line (double-click .txt/.md)
    const fileArg = process.argv.find((arg) => arg.endsWith('.txt') || arg.endsWith('.md') || arg.endsWith('.markdown'));
    if (fileArg) {
      handleFileOpen(fileArg);
    } else {
      // Show main window on start if enabled (default: true)
      const showOnStart = store.get('showOnStart' as any);
      if (showOnStart === undefined || showOnStart === true) {
        createMainWindow();
      }
    }

    app.setLoginItemSettings({
      openAtLogin: true,
      path: app.getPath('exe'),
    });

    // Check for updates
    checkForUpdates();
  }, 3000);
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
