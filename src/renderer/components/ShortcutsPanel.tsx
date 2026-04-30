import React from 'react';
import { useLang } from '../LangContext';

interface Props {
  onClose: () => void;
}

function ShortcutsPanel({ onClose }: Props) {
  const { t } = useLang();

  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-panel" onClick={(e) => e.stopPropagation()}>
        <h3>{t('shortcuts')}</h3>

        <div className="shortcut-group">
          <h4>{t('global')}</h4>
          <div className="shortcut-row">
            <span>{t('openNotes')}</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>Q</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>{t('lastNote')}</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Q</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>{t('screenshotToNote')}</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>{t('screenshotToClipboard')}</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>C</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>{t('clipboardToNote')}</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd></span>
          </div>
        </div>

        <div className="shortcut-group">
          <h4>{t('notesList')}</h4>
          <div className="shortcut-row">
            <span>{t('newNote')}</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>N</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>{t('searchNote')}</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>P</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>{t('showShortcuts')}</span>
            <span className="shortcut-key"><kbd>?</kbd></span>
          </div>
        </div>

        <div className="shortcut-group">
          <h4>{t('editor')}</h4>
          <div className="shortcut-row">
            <span>{t('searchReplace')}</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>F</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>{t('slashCommands')}</span>
            <span className="shortcut-key"><kbd>/</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>{t('bold')}</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>B</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>{t('italic')}</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>I</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>{t('strikethrough')}</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>{t('undo')} / {t('redo')}</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Y</kbd></span>
          </div>
          <div className="shortcut-row">
            <span>{t('pasteImage')}</span>
            <span className="shortcut-key"><kbd>Ctrl</kbd>+<kbd>V</kbd></span>
          </div>
        </div>

        <div className="shortcut-group">
          <h4>{t('noteWindow')}</h4>
          <div className="shortcut-row">
            <span>{t('alwaysOnTop')}</span>
            <span className="shortcut-key">{t('pinIcon')}</span>
          </div>
          <div className="shortcut-row">
            <span>{t('stickyNote')}</span>
            <span className="shortcut-key">{t('stickyIcon')}</span>
          </div>
          <div className="shortcut-row">
            <span>{t('tableOfContents')}</span>
            <span className="shortcut-key">{t('tocIcon')}</span>
          </div>
          <div className="shortcut-row">
            <span>{t('emoji')}</span>
            <span className="shortcut-key">{t('emojiIcon')}</span>
          </div>
          <div className="shortcut-row">
            <span>{t('exportMd')}</span>
            <span className="shortcut-key">{t('downloadIcon')}</span>
          </div>
          <div className="shortcut-row">
            <span>{t('reminder')}</span>
            <span className="shortcut-key">{t('bellIcon')}</span>
          </div>
          <div className="shortcut-row">
            <span>{t('lockNote')}</span>
            <span className="shortcut-key">{t('lockIcon')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShortcutsPanel;
