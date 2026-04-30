import React from 'react';
import { Editor } from '@tiptap/react';
import { useLang } from '../LangContext';

interface Props {
  editor: Editor;
  onInsertNoteLink?: () => void;
}

function Toolbar({ editor, onInsertNoteLink }: Props) {
  const { t } = useLang();

  const colors = [
    { label: t('textDefault'), value: '' },
    { label: t('textRed'), value: '#ef4444' },
    { label: t('textBlue'), value: '#3b82f6' },
    { label: t('textGreen'), value: '#10b981' },
    { label: t('textOrange'), value: '#f59e0b' },
    { label: t('textPurple'), value: '#8b5cf6' },
    { label: t('textPink'), value: '#ec4899' },
  ];

  const highlightColors = [
    { label: t('highlightNone'), value: '' },
    { label: t('highlightYellow'), value: '#fef08a' },
    { label: t('highlightGreen'), value: '#bbf7d0' },
    { label: t('highlightBlue'), value: '#bfdbfe' },
    { label: t('highlightPink'), value: '#fecdd3' },
    { label: t('highlightOrange'), value: '#fed7aa' },
    { label: t('highlightPurple'), value: '#e9d5ff' },
  ];

  return (
    <div className="toolbar" role="toolbar" aria-label={t('bold')}>
      <div className="toolbar-group">
        <button
          className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title={`${t('bold')} (Ctrl+B)`}
          aria-label={t('bold')}
        >
          <strong>B</strong>
        </button>
        <button
          className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title={`${t('italic')} (Ctrl+I)`}
          aria-label={t('italic')}
        >
          <em>I</em>
        </button>
        <button
          className={`toolbar-btn ${editor.isActive('strike') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title={t('strikethrough')}
          aria-label={t('strikethrough')}
        >
          <s>S</s>
        </button>
        <button
          className={`toolbar-btn ${editor.isActive('code') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title={t('code')}
          aria-label={t('code')}
        >
          {'</>'}
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button
          className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title={t('heading1')}
          aria-label={t('heading1')}
        >
          H1
        </button>
        <button
          className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title={t('heading2')}
          aria-label={t('heading2')}
        >
          H2
        </button>
        <button
          className={`toolbar-btn ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title={t('heading3')}
          aria-label={t('heading3')}
        >
          H3
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button
          className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title={t('bulletList')}
          aria-label={t('bulletList')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>
        </button>
        <button
          className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title={t('orderedList')}
          aria-label={t('orderedList')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="3" y="7" fontSize="6" fill="currentColor" stroke="none">1</text><text x="3" y="13" fontSize="6" fill="currentColor" stroke="none">2</text><text x="3" y="19" fontSize="6" fill="currentColor" stroke="none">3</text></svg>
        </button>
        <button
          className={`toolbar-btn ${editor.isActive('taskList') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          title={t('taskList')}
          aria-label={t('taskList')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        </button>
        <button
          className={`toolbar-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title={t('quote')}
          aria-label={t('quote')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/></svg>
        </button>
      </div>

      <div className="toolbar-separator" />

      {/* Table */}
      <div className="toolbar-group">
        <button
          className="toolbar-btn"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          title={t('table')}
          aria-label={t('table')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
        </button>
        {onInsertNoteLink && (
          <button
            className="toolbar-btn"
            onClick={onInsertNoteLink}
            title={`${t('noteLink')} [[]]`}
            aria-label={t('noteLink')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </button>
        )}
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <label className="toolbar-label" htmlFor="text-color">{t('textColor')}</label>
        <select
          id="text-color"
          className="toolbar-select"
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().setColor(e.target.value).run();
            } else {
              editor.chain().focus().unsetColor().run();
            }
          }}
          aria-label={t('textColor')}
        >
          {colors.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar-group">
        <label className="toolbar-label" htmlFor="highlight-color">{t('highlight')}</label>
        <select
          id="highlight-color"
          className="toolbar-select"
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().toggleHighlight({ color: e.target.value }).run();
            } else {
              editor.chain().focus().unsetHighlight().run();
            }
          }}
          aria-label={t('highlight')}
        >
          {highlightColors.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button
          className="toolbar-btn"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title={t('horizontalRule')}
          aria-label={t('horizontalRule')}
        >
          ―
        </button>
        <button
          className="toolbar-btn"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title={`${t('undo')} (Ctrl+Z)`}
          aria-label={t('undo')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
        </button>
        <button
          className="toolbar-btn"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title={`${t('redo')} (Ctrl+Y)`}
          aria-label={t('redo')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/></svg>
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
