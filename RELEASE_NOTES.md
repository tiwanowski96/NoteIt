# NoteIt Notes v1.0.4

## Changes

### Added
- File associations — NoteIt now appears in "Open with" for .txt and .md files
- Global search with content preview — Ctrl+P searches inside note content with highlighted matches
- Search results show content snippet, tags, and match count
- Single instance lock — opening a file when NoteIt is running reuses existing instance

### Improved
- Search results increased from 10 to 20
- Auto-scroll to selected result in command palette
- Install location changed to Program Files (per-machine)

---

**Download:** `NoteIt_Notes_Setup_1.0.4.exe`

**Requirements:** Windows 10 or later (x64)

*© 2026 The Cloudest – Tomasz Iwanowski*

---

# NoteIt Notes v1.0.3

## Changes

### Fixed
- Custom tile icons for Microsoft Store (fixes certification rejection for default tiles)

### Added
- Note templates now match selected language (EN templates when English, PL when Polish)
- Version number in Settings is now dynamic (read from package.json)
- Changelog entries for v1.0.1, v1.0.2, and v1.0.3

### Improved
- Installer and AppX file naming: `NoteIt_Notes_Setup_1.0.3.exe` / `.appx`

---

**Download:** `NoteIt_Notes_Setup_1.0.3.exe`

**Requirements:** Windows 10 or later (x64)

*© 2026 The Cloudest – Tomasz Iwanowski*

---

# NoteIt Notes v1.0.1

## Changes

### Fixed
- Application icon now displays correctly in Windows Start Menu, taskbar, and system tray
- Fixed icon embedding in the built executable

### Added
- Auto-update checker – app checks GitHub for new versions on startup (can be disabled in Settings)
- Update banner on main page when a new version is available
- "Check for updates" toggle in Settings
- Documentation link (User Guide) in Settings
- Updated Privacy Policy to reflect update checking

### Improved
- Better icon resolution support (multi-size ICO: 16, 32, 48, 64, 128, 256px)
- Assets now properly bundled as extra resources for production builds

---

**Download:** `NoteIt Notes Setup 1.0.1.exe`

**Requirements:** Windows 10 or later (x64)

*© 2026 The Cloudest – Tomasz Iwanowski*

---

# NoteIt v1.0.0 – Initial Release

**NoteIt** is a fast, beautiful, and fully local desktop notes app for Windows. All your data stays on your device – no internet, no tracking, no cloud.

## Features

### Editor
- Rich text formatting (bold, italic, headings, lists, code blocks, quotes)
- Checklists with clickable checkboxes
- Tables (insert via toolbar or paste from Excel/Google Sheets)
- Colors, highlights, and text styling
- Paste screenshots (Ctrl+V) and drag & drop images
- Slash commands (/) for quick insertion
- Emoji picker
- Table of contents (auto-generated from headings)
- Find & Replace (Ctrl+F)
- Adjustable editor font size

### Organization
- Grid, List, and Kanban views
- Tags (up to 3 per note) with filtering
- Pinning important notes
- Sorting by date edited, date created, or name
- Search across all notes
- Command Palette (Ctrl+P)
- Subnotes (hierarchical note structure with breadcrumbs)

### Productivity
- Pomodoro timer with mini always-on-top mode
- Reminders with Windows notifications
- Templates (Meeting, Task list, Journal, Project, Brainstorm)
- Sticky notes – pin to desktop as floating widget
- Always on top mode for note windows

### Security & Privacy
- PIN encryption for individual notes
- 100% local – no internet connection, no data leaves your device
- No analytics, no tracking

### System Integration
- System tray with quick access menu
- Global shortcuts (Ctrl+Q, Ctrl+Shift+Q, Ctrl+Shift+S, Ctrl+Shift+V)
- Screenshot tool with area selection
- Auto-start with Windows
- Custom frameless window design

### Import / Export
- Import .md, .txt, .zip files
- Export as .zip (with full metadata) or single .md
- Round-trip: exported notes retain tags, colors, reminders, encryption on re-import

### Other
- English and Polish language support
- Light and dark themes
- Onboarding wizard for first-time users
- Keyboard shortcuts panel
- Changelog in settings

## Download

- **Windows installer:** `NoteIt Setup 1.0.0.exe`
- **Microsoft Store package:** `NoteIt 1.0.0.appx`

## Requirements

- Windows 10 or later (x64)

---

*Built with Electron, React, TypeScript, and Tiptap.*

*© 2026 The Cloudest – Tomasz Iwanowski*
