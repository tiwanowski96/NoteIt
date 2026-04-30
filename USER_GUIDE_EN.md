# NoteIt – User Guide

## Table of Contents

- [Getting Started](#getting-started)
- [Main Window](#main-window)
- [Creating Notes](#creating-notes)
- [Editor](#editor)
- [Note Features](#note-features)
- [Organization](#organization)
- [Screenshots](#screenshots)
- [Pomodoro Timer](#pomodoro-timer)
- [Import / Export](#import--export)
- [Search](#search)
- [Trash](#trash)
- [Settings](#settings)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Privacy](#privacy)

---

## Getting Started

### Installation

1. Download the latest NoteIt installer for Windows.
2. Run the installer – it will set up NoteIt and create a system tray icon.
3. NoteIt starts automatically with Windows by default.

### First Launch

On first launch you will see a short onboarding walkthrough covering:

- How NoteIt lives in the system tray (icon near the clock).
- Global keyboard shortcuts that work from any application.
- Editor basics (paste screenshots, slash commands, search & replace).
- Key features overview (reminders, Pomodoro, templates, encryption, etc.).

### System Tray

NoteIt runs in the background as a system tray icon. Double-click the tray icon to open the main notes window. Right-click for a context menu with:

- **Open notes** – show the main window
- **Last note** – open the most recently edited note
- **Recent notes** – quick access to your 5 latest notes
- **Close NoteIt** – fully quit the application

---

## Main Window

The main window displays all your notes and provides tools for searching, filtering, and organizing.

### Views

| View | Description |
|------|-------------|
| **Grid** | Notes displayed as cards in a responsive grid |
| **List** | Compact single-column list with title and preview |
| **Kanban** | Three columns: To do, In progress, Done – drag & drop between them |

### Search

A search bar at the top filters notes by title and content in real time.

### Filters & Sorting

- **Tag filter** – select a tag to show only notes with that tag
- **Sort by** – Last edited, Date created, or Name (alphabetical)

### Tags

Tags are displayed on note cards. Click a tag in the filter bar to show only matching notes.

---

## Creating Notes

### Templates

When creating a new note, choose from built-in templates:

| Template | Description |
|----------|-------------|
| Empty | Blank note |
| Meeting | Pre-structured meeting notes |
| Task list | Checklist-based task list |
| Journal | Daily journal entry |
| Project | Project planning structure |
| Brainstorm | Free-form brainstorming |

### New Note

Click the **"New note"** button or press **Ctrl+N** to create a note. A template picker appears – select one and start writing.

### Title & Content

- The title field is at the top of the editor.
- Content is written in the rich text editor below.

---

## Editor

NoteIt uses a powerful rich text editor (Tiptap) with full formatting support.

### Text Formatting

| Format | Shortcut | Description |
|--------|----------|-------------|
| **Bold** | Ctrl+B | Bold text |
| *Italic* | Ctrl+I | Italic text |
| ~~Strikethrough~~ | Ctrl+Shift+X | Strikethrough text |
| `Code` | Ctrl+E | Inline code |
| Heading 1 | Ctrl+Alt+1 | Large heading |
| Heading 2 | Ctrl+Alt+2 | Medium heading |
| Heading 3 | Ctrl+Alt+3 | Small heading |
| Bullet list | Ctrl+Shift+8 | Unordered list |
| Ordered list | Ctrl+Shift+7 | Numbered list |
| Checklist | Ctrl+Shift+9 | Task list with checkboxes |
| Quote | Ctrl+Shift+B | Blockquote |
| Horizontal rule | — | Separator line |

### Tables

Insert tables via the toolbar button or the `/table` slash command. Tables support headers, rows, and columns.

### Code Blocks

Use the slash command `/code` or toolbar to insert code blocks.

### Colors & Highlights

- **Text color** – choose from: Default, Red, Blue, Green, Orange, Purple, Pink
- **Highlight** – choose from: None, Yellow, Green, Blue, Pink, Orange, Purple

### Images

- **Paste** – Ctrl+V to paste an image from clipboard
- **Drag & drop** – drag an image file into the editor

### Slash Commands

Type `/` in the editor to open the command menu. Available commands include:

- `/heading1`, `/heading2`, `/heading3` – insert headings
- `/bullet` – bullet list
- `/ordered` – ordered list
- `/checklist` – task list
- `/table` – insert table
- `/code` – code block
- `/quote` – blockquote
- `/hr` – horizontal rule
- `/image` – insert image

### Emoji Picker

Click the emoji button (😊) in the note toolbar to open the emoji picker and insert emojis into your text.

### Table of Contents

Click the table of contents icon (lines icon) in the note toolbar to view a navigable outline of all headings in the current note.

### Font Size Control

Adjust the application text size in Settings → Appearance → App text size (range: -2 to +2).

---

## Note Features

### Tags

- Add up to **3 tags** per note.
- Type a tag name and press Enter to add it.
- Tags are used for filtering in the main window.

### Colors

Assign a color to a note card for visual organization. Available colors:

- None, Red, Blue, Green, Yellow, Purple, Orange

### Reminders

- Set a reminder with a custom date and time using the built-in date picker.
- When the reminder time arrives, NoteIt shows a desktop notification.
- Click the notification to open the note.
- Remove a reminder at any time.

### Encryption (PIN Lock)

- Lock a note with a PIN (minimum 4 characters).
- A locked note cannot be read without entering the correct PIN.
- Remove encryption by entering the PIN and choosing "Remove lock".
- PIN is hashed locally – there is no recovery if forgotten.

### Subnotes (Hierarchical Notes)

- Create child notes (subnotes) under any note.
- Navigate the hierarchy via breadcrumbs.
- Move notes between parents using drag & drop in the note tree.

### Links Between Notes

- Insert a link to another note using the "Link to note" toolbar button.
- Click the link to navigate directly to the referenced note.

### Always on Top

- Toggle "Always on top" in the note window to keep it above all other windows.

### Sticky Notes

- Pin a note to the desktop as a small, always-on-top sticky widget.
- The sticky note shows the title and content in a compact, draggable window.

### Export as Markdown

- Export any single note as a `.md` file from the note toolbar (download icon).

---

## Organization

### Grid View

Notes displayed as cards in a responsive grid layout. Each card shows the title, a content preview, tags, and color indicator.

### List View

A compact vertical list showing note title, last edited date, and tags.

### Kanban View

Three columns for workflow management:

| Column | Description |
|--------|-------------|
| **To do** | Notes waiting to be started |
| **In progress** | Notes currently being worked on |
| **Done** | Completed notes |

Drag and drop notes between columns to change their status.

### Pinning Notes

Pin important notes to keep them at the top of the list regardless of sort order.

### Selection Mode

- Enter selection mode to select multiple notes.
- **Select all / Deselect all** buttons for quick selection.
- **Bulk delete** – move all selected notes to trash.
- **Bulk export** – export selected notes as a `.zip` archive.

---

## Screenshots

NoteIt provides global screenshot shortcuts that work from any application:

| Shortcut | Action |
|----------|--------|
| **Ctrl+Shift+S** | Take a screenshot and save it as a new note (or paste into the currently open note) |
| **Ctrl+Shift+C** | Take a screenshot and copy it to the clipboard |

### Area Selection

After pressing the shortcut:

1. The screen dims and a crosshair cursor appears.
2. Click and drag to select the area you want to capture.
3. Release to capture. Press **ESC** to cancel.

The selected area is cropped and either saved to a note or copied to the clipboard.

---

## Pomodoro Timer

A built-in Pomodoro timer to help you focus.

### Work / Break Modes

- **Work** – focused work session (default 25 minutes)
- **Break** – rest period (default 5 minutes)

### Controls

- **Start / Pause** – toggle the timer
- **Reset** – reset the current session
- **Skip** – skip to the next mode (work → break or break → work)

### Mini Mode

- Click "Mini mode" to open a compact, always-on-top floating timer pill.
- The mini timer shows the current mode, remaining time, and play/pause control.
- Click the expand button to return to the full timer.

### Sessions Counter

Tracks how many Pomodoro sessions you have completed.

### Sound Notification

A sound plays when a session ends to alert you.

---

## Import / Export

### Import

- **Supported formats:** `.md`, `.txt`, `.markdown`, `.zip`
- Access via the hamburger menu → "Import files"
- Select one or multiple files to import.
- ZIP files exported from NoteIt (containing `noteit-metadata.json`) will restore full note metadata (tags, colors, reminders, kanban status).
- ZIP files without metadata will import each `.md`/`.txt` file as a separate note.

### Export ZIP

- Select multiple notes in selection mode and click "Export .zip".
- The ZIP contains:
  - `noteit-metadata.json` – full note data for re-import
  - Individual `.md` files – human-readable Markdown versions

### Export Single Note

- Open a note and click the download icon → "Export as Markdown"
- Saves the note as a `.md` file to a location of your choice.

---

## Search

### Main Search Bar

Located at the top of the main window. Filters notes by title and content as you type.

### Command Palette (Ctrl+P)

- Press **Ctrl+P** to open the command palette.
- Type to search notes by title.
- Use arrow keys to navigate results, Enter to open.

### Find & Replace in Editor (Ctrl+F)

- Press **Ctrl+F** while editing a note to open the search bar within the editor.
- Search for text within the current note.
- Replace individual occurrences or replace all.

---

## Trash

### Soft Delete

- Deleted notes are moved to the trash and kept for **30 days**.
- After 30 days, notes are automatically permanently deleted.

### Restore

- Open the trash view and click "Restore" to bring a note back to the main list.

### Permanent Delete

- Click "Delete permanently" to immediately and irreversibly remove a note.

### Selection Mode in Trash

- Select multiple trashed notes to restore or permanently delete them in bulk.

---

## Settings

Access settings from the hamburger menu → "Settings".

| Setting | Description |
|---------|-------------|
| **App text size** | Adjust the UI font size (-2 to +2) |
| **Language** | Switch between English (EN) and Polish (PL) |
| **Start with Windows** | Auto-launch NoteIt on Windows login |
| **Show window on start** | Open the main window on launch (or start hidden in tray) |
| **Privacy Policy** | View the privacy policy |
| **Licenses** | View open source licenses |
| **What's new** | View the changelog |
| **Documentation** | Open the online user guide |

---

## Keyboard Shortcuts

### Global Shortcuts (work from any application)

| Shortcut | Action |
|----------|--------|
| Ctrl+Q | Open all notes |
| Ctrl+Shift+Q | Open last edited note |
| Ctrl+Shift+S | Screenshot → save to note |
| Ctrl+Shift+C | Screenshot → copy to clipboard |
| Ctrl+Shift+V | Paste clipboard text as new note |

### Notes List

| Shortcut | Action |
|----------|--------|
| Ctrl+N | New note |
| Ctrl+P | Command palette (search notes) |
| Ctrl+K | Show keyboard shortcuts |

### Text Editor

| Shortcut | Action |
|----------|--------|
| Ctrl+B | Bold |
| Ctrl+I | Italic |
| Ctrl+Shift+X | Strikethrough |
| Ctrl+E | Inline code |
| Ctrl+Alt+1 | Heading 1 |
| Ctrl+Alt+2 | Heading 2 |
| Ctrl+Alt+3 | Heading 3 |
| Ctrl+Shift+8 | Bullet list |
| Ctrl+Shift+7 | Ordered list |
| Ctrl+Shift+9 | Checklist |
| Ctrl+Shift+B | Blockquote |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z | Redo |
| Ctrl+F | Find & Replace |
| / | Slash commands |
| Ctrl+V | Paste image / screenshot |

### Note Window

| Icon / Action | Description |
|---------------|-------------|
| Pin icon | Pin note to top |
| Sticky icon | Pin as desktop sticky note |
| Lines icon | Table of contents |
| Smile icon | Emoji picker |
| Download icon | Export as Markdown |
| Bell icon | Set reminder |
| Lock icon | Encrypt / decrypt note |

---

## Privacy

NoteIt is a fully local, offline application:

- **All data is stored locally** on your device using electron-store.
- **No internet connection** is required or used. The app never connects to external servers.
- **No tracking** – no analytics, telemetry, or advertising of any kind.
- **No third-party services** – your notes never leave your computer.
- **Full control** – you can delete all data at any time by removing the app's data directory.

### Data Location

NoteIt stores all data in the following location on Windows:

```
%APPDATA%\noteit\
```

Typically: `C:\Users\<YourUsername>\AppData\Roaming\noteit\`

This directory contains:
- `config.json` – all notes, settings, and metadata

To back up your data, copy this file. To reset the app, delete it.

Your notes are yours alone.
