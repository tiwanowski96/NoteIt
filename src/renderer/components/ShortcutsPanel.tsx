import React from 'react';

interface Props {
  onClose: () => void;
}

function ShortcutsPanel({ onClose }: Props) {
  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-panel" onClick={(e) => e.stopPropagation()}>
        <h3>Skroty klawiszowe</h3>

        <div className="shortcut-group">
          <h4>Globalne (z dowolnej aplikacji)</h4>
          <div className="shortcut-row">
            <span>Otworz notatki</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>Q</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>Ostatnia notatka</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Q</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>Screenshot do notatki</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>Screenshot do schowka</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>C</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>Schowek jako nowa notatka</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd></span>
          </div>
        </div>

        <div className="shortcut-group">
          <h4>Lista notatek</h4>
          <div className="shortcut-row">
            <span>Nowa notatka</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>N</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>Szukaj notatki (palette)</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>P</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>Pokaz skroty</span>
            <span className="shortcut-key"><kbd>?</kbd></span>
          </div>
        </div>

        <div className="shortcut-group">
          <h4>Edytor tekstu</h4>
          <div className="shortcut-row">
            <span>Szukaj i zamien</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>F</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>Slash commands</span>
            <span className="shortcut-key"><kbd>/</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>Pogrubienie</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>B</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>Kursywa</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>I</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>Przekreslenie</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>Cofnij / Ponow</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Y</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>Wklej obraz/tabele</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>V</kbd></span>
          </div>
        </div>

        <div className="shortcut-group">
          <h4>Okno notatki</h4>
          <div className="shortcut-row">
            <span>Zawsze na wierzchu</span>
            <span className="shortcut-key">Ikona pinezki</span>
          </div>
          <div className="shortcut-row">
            <span>Sticky note na pulpicie</span>
            <span className="shortcut-key">Ikona karteczki</span>
          </div>
          <div className="shortcut-row">
            <span>Spis tresci</span>
            <span className="shortcut-key">Ikona linii</span>
          </div>
          <div className="shortcut-row">
            <span>Emoji</span>
            <span className="shortcut-key">Ikona usmiech</span>
          </div>
          <div className="shortcut-row">
            <span>Eksport .md</span>
            <span className="shortcut-key">Ikona pobierania</span>
          </div>
          <div className="shortcut-row">
            <span>Przypomnienie</span>
            <span className="shortcut-key">Ikona dzwonka</span>
          </div>
          <div className="shortcut-row">
            <span>Szyfrowanie PIN</span>
            <span className="shortcut-key">Ikona klodki</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShortcutsPanel;
