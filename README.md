# NoteIt 📝

Desktopowa aplikacja do notatek dla Windows z system tray, rich text edytorem i łatwym wklejaniem screenshotów.

## Funkcje

- 🖥️ **System Tray** – aplikacja działa w tle jako ikona przy zegarku
- 🚀 **Autostart** – uruchamia się automatycznie z Windows
- ⌨️ **Ctrl+Q** – otwiera okno ze wszystkimi notatkami
- ⌨️ **Ctrl+Shift+Q** – otwiera ostatnią notatkę
- 🎨 **Rich Text** – formatowanie tekstu, kolory, zakreślacz
- 📸 **Screenshoty** – wklej screenshot przez Ctrl+V
- 💾 **Lokalne przechowywanie** – notatki zapisywane na dysku

## Instalacja i uruchomienie

```bash
# Zainstaluj zależności
npm install

# Uruchom w trybie deweloperskim
npm run dev

# Zbuduj aplikację (.exe)
npm run build
```

## Tryb deweloperski

1. `npm install` – instalacja zależności
2. W jednym terminalu: `npx vite --root src/renderer` – uruchom frontend
3. W drugim terminalu: `npm run dev:main` – uruchom Electron

## Skróty klawiszowe

| Skrót | Akcja |
|-------|-------|
| Ctrl+Q | Otwórz wszystkie notatki |
| Ctrl+Shift+Q | Otwórz ostatnią notatkę |
| Ctrl+V | Wklej screenshot/obraz |
| Ctrl+B | Pogrubienie |
| Ctrl+I | Kursywa |
| Ctrl+Z | Cofnij |

## Technologie

- Electron 28
- React 18
- Tiptap (rich text editor)
- Vite (bundler)
- TypeScript
- electron-store (lokalne dane)
