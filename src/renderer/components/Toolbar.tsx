import React from 'react';
import { Editor } from '@tiptap/react';

interface Props {
  editor: Editor;
}

function Toolbar({ editor }: Props) {
  const colors = [
    { label: 'Domyślny', value: '' },
    { label: 'Czerwony', value: '#ef4444' },
    { label: 'Niebieski', value: '#3b82f6' },
    { label: 'Zielony', value: '#10b981' },
    { label: 'Pomarańczowy', value: '#f59e0b' },
    { label: 'Fioletowy', value: '#8b5cf6' },
    { label: 'Różowy', value: '#ec4899' },
  ];

  const highlightColors = [
    { label: 'Brak', value: '' },
    { label: 'Żółty', value: '#fef08a' },
    { label: 'Zielony', value: '#bbf7d0' },
    { label: 'Niebieski', value: '#bfdbfe' },
    { label: 'Różowy', value: '#fecdd3' },
    { label: 'Pomarańczowy', value: '#fed7aa' },
    { label: 'Fioletowy', value: '#e9d5ff' },
  ];

  return (
    <div className="toolbar" role="toolbar" aria-label="Formatowanie tekstu">
      <div className="toolbar-group">
        <button
          className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Pogrubienie (Ctrl+B)"
          aria-label="Pogrubienie"
        >
          <strong>B</strong>
        </button>
        <button
          className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Kursywa (Ctrl+I)"
          aria-label="Kursywa"
        >
          <em>I</em>
        </button>
        <button
          className={`toolbar-btn ${editor.isActive('strike') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Przekreślenie"
          aria-label="Przekreślenie"
        >
          <s>S</s>
        </button>
        <button
          className={`toolbar-btn ${editor.isActive('code') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Kod"
          aria-label="Kod inline"
        >
          {'</>'}
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button
          className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Nagłówek 1"
          aria-label="Nagłówek 1"
        >
          H1
        </button>
        <button
          className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Nagłówek 2"
          aria-label="Nagłówek 2"
        >
          H2
        </button>
        <button
          className={`toolbar-btn ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Nagłówek 3"
          aria-label="Nagłówek 3"
        >
          H3
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button
          className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Lista punktowana"
          aria-label="Lista punktowana"
        >
          Lista
        </button>
        <button
          className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Lista numerowana"
          aria-label="Lista numerowana"
        >
          1. 2. 3.
        </button>
        <button
          className={`toolbar-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Cytat"
          aria-label="Cytat"
        >
          Cytat
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <label className="toolbar-label" htmlFor="text-color">Kolor:</label>
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
          aria-label="Kolor tekstu"
        >
          {colors.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar-group">
        <label className="toolbar-label" htmlFor="highlight-color">Zakreślacz:</label>
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
          aria-label="Kolor zakreślacza"
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
          title="Linia pozioma"
          aria-label="Linia pozioma"
        >
          ―
        </button>
        <button
          className="toolbar-btn"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Cofnij (Ctrl+Z)"
          aria-label="Cofnij"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
        </button>
        <button
          className="toolbar-btn"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Ponów (Ctrl+Y)"
          aria-label="Ponów"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/></svg>
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
