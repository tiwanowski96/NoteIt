import React from 'react';

interface Props {
  onClose: () => void;
}

function ShortcutsPanel({ onClose }: Props) {
  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-panel" onClick={(e) => e.stopPropagation()}>
        <h3>Skróty klawiszowe</h3>

        <div className="shortcut-group">
          <h4>Globalne</h4>
          <div className="shortcut-row">
            <span>Otwórz notatki</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>Q</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>Ostatnia notatka</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Q</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>Screenshot → notatka</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>Screenshot → schowek</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>C</kbd></span>
          </div>
        </div>

        <div className="shortcut-group">
          <h4>Lista notatek</h4>
          <div className="shortcut-row">
            <span>Nowa notatka</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>N</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>Skróty klawiszowe</span>
            <span className="shortcut-key"><kbd>?</kbd></span>
          </div>
        </div>

        <div className="shortcut-group">
          <h4>Edytor</h4>
          <div className="shortcut-row">
            <span>Szukaj i zamień</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>F</kbd></span>
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
            <span>Przekreślenie</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>Cofnij</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>Z</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>Ponów</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>Y</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>Wklej screenshot</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>V</kbd></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShortcutsPanel;
