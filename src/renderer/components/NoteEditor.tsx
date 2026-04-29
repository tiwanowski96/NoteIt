import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import { Note } from '../types';
import Toolbar from './Toolbar';
import { ArrowLeftIcon, TrashIcon, SunIcon, MoonIcon } from './Icons';
import { SearchHighlightExtension, searchHighlightPluginKey, getSearchDecorations } from './SearchHighlight';
import DateTimePicker from './DateTimePicker';

interface Props {
  note: Note;
  onSave: (note: Note) => void;
  onBack: () => void;
  onDelete: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const noteColors = [
  { label: 'Brak', key: '', light: '', dark: '' },
  { label: 'Czerwony', key: 'red', light: '#fef2f2', dark: '#3b1c1c' },
  { label: 'Niebieski', key: 'blue', light: '#eff6ff', dark: '#1c2a3b' },
  { label: 'Zielony', key: 'green', light: '#f0fdf4', dark: '#1c3b24' },
  { label: 'Żółty', key: 'yellow', light: '#fefce8', dark: '#3b3a1c' },
  { label: 'Fioletowy', key: 'purple', light: '#faf5ff', dark: '#2d1c3b' },
  { label: 'Pomarańczowy', key: 'orange', light: '#fff7ed', dark: '#3b2a1c' },
];

function getColorHex(colorKey: string, currentTheme: 'light' | 'dark'): string {
  const found = noteColors.find((c) => c.key === colorKey);
  if (!found) return '';
  return currentTheme === 'dark' ? found.dark : found.light;
}

function toLocalDatetimeString(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function NoteEditor({ note, onSave, onBack, onDelete, theme, onToggleTheme }: Props) {
  const [title, setTitle] = useState(note.title);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [color, setColor] = useState(note.color || '');
  const [reminder, setReminder] = useState(note.reminder || '');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | ''>('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showFind, setShowFind] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [findCount, setFindCount] = useState(0);
  const [activeMatch, setActiveMatch] = useState(0);
  const [showReplace, setShowReplace] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'note-link',
        },
      }),
      SearchHighlightExtension,
    ],
    content: note.content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
      setCharCount(text.length);
      debouncedSave(html);
      // Re-apply search highlights after content change
      if (findText) {
        updateSearchHighlights(findText, activeMatch);
      }
    },
  });

  useEffect(() => {
    if (editor) {
      const text = editor.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
      setCharCount(text.length);
    }
  }, [editor]);

  // Update search highlights when findText or activeMatch changes
  useEffect(() => {
    if (!editor) return;
    if (!findText) {
      clearSearchHighlights();
      setFindCount(0);
      return;
    }
    updateSearchHighlights(findText, activeMatch);
  }, [findText, activeMatch, editor]);

  function updateSearchHighlights(search: string, active: number) {
    if (!editor) return;
    const { decorationSet, totalMatches } = getSearchDecorations(
      editor.state.doc,
      search,
      active
    );
    setFindCount(totalMatches);

    const tr = editor.state.tr.setMeta(searchHighlightPluginKey, decorationSet);
    editor.view.dispatch(tr);

    // Scroll active match into view
    setTimeout(() => {
      const activeEl = editor.view.dom.querySelector('.search-highlight-active');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }, 10);
  }

  function clearSearchHighlights() {
    if (!editor) return;
    const { decorationSet } = getSearchDecorations(editor.state.doc, '', 0);
    const tr = editor.state.tr.setMeta(searchHighlightPluginKey, decorationSet);
    editor.view.dispatch(tr);
  }

  // Handle paste and drag&drop for images
  useEffect(() => {
    if (!editor) return;

    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          event.preventDefault();
          insertImageFile(item.getAsFile()!);
          return;
        }
      }
    };

    const handleDrop = (event: DragEvent) => {
      const files = event.dataTransfer?.files;
      if (!files) return;
      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          event.preventDefault();
          insertImageFile(file);
          return;
        }
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener('paste', handlePaste);
    editorElement.addEventListener('drop', handleDrop);
    return () => {
      editorElement.removeEventListener('paste', handlePaste);
      editorElement.removeEventListener('drop', handleDrop);
    };
  }, [editor]);

  // Listen for screenshot paste from main process
  useEffect(() => {
    const unsub = window.electronAPI.onPasteScreenshot((dataUrl: string) => {
      if (editor) {
        editor.chain().focus().setImage({ src: dataUrl }).run();
      }
    });
    return unsub;
  }, [editor]);

  // Ctrl+F shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowFind((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  function insertImageFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      editor?.chain().focus().setImage({ src: dataUrl }).run();
    };
    reader.readAsDataURL(file);
  }

  const debouncedSave = useCallback((content: string) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      onSave({ ...note, title, content, tags, color, reminder });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    }, 500);
  }, [note, title, tags, color, reminder, onSave]);

  const handleSave = useCallback(
    (content?: string) => {
      onSave({
        ...note,
        title,
        content: content ?? editor?.getHTML() ?? note.content,
        tags,
        color,
        reminder,
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    },
    [note, title, editor, onSave, tags, color, reminder]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    handleSave();
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      if (tags.length >= 3) { setTagInput(''); return; }
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        const newTags = [...tags, newTag];
        setTags(newTags);
        onSave({ ...note, title, content: editor?.getHTML() ?? note.content, tags: newTags, color });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((t) => t !== tagToRemove);
    setTags(newTags);
    onSave({ ...note, title, content: editor?.getHTML() ?? note.content, tags: newTags, color });
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    onSave({ ...note, title, content: editor?.getHTML() ?? note.content, tags, color: newColor, reminder });
  };

  const handleReminderChange = (value: string) => {
    setReminder(value);
    onSave({ ...note, title, content: editor?.getHTML() ?? note.content, tags, color, reminder: value });
  };

  const handleExport = (format: string) => {
    window.electronAPI.exportNote(note.id, format);
  };

  // Find & Replace
  const handleFindNext = () => {
    if (findCount === 0) return;
    setActiveMatch((prev) => (prev + 1) % findCount);
  };

  const handleFindPrev = () => {
    if (findCount === 0) return;
    setActiveMatch((prev) => (prev - 1 + findCount) % findCount);
  };

  const handleReplace = () => {
    if (!editor || !findText || findCount === 0) return;

    // Find the position of the active match
    const searchLower = findText.toLowerCase();
    let matchCount = 0;
    let replaceFrom = -1;
    let replaceTo = -1;

    editor.state.doc.descendants((node, pos) => {
      if (!node.isText || replaceFrom >= 0) return;
      const text = node.text || '';
      const textLower = text.toLowerCase();
      let index = textLower.indexOf(searchLower);
      while (index >= 0) {
        if (matchCount === activeMatch) {
          replaceFrom = pos + index;
          replaceTo = replaceFrom + findText.length;
          return;
        }
        matchCount++;
        index = textLower.indexOf(searchLower, index + 1);
      }
    });

    if (replaceFrom >= 0) {
      editor.chain()
        .focus()
        .setTextSelection({ from: replaceFrom, to: replaceTo })
        .deleteSelection()
        .insertContent(replaceText)
        .run();
    }
  };

  const handleReplaceAll = () => {
    if (!editor || !findText) return;
    const content = editor.getHTML();
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const newContent = content.replace(regex, replaceText);
    editor.commands.setContent(newContent);
    setFindCount(0);
    setActiveMatch(0);
  };

  const closeFind = () => {
    setShowFind(false);
    setShowReplace(false);
    setFindText('');
    setReplaceText('');
    setFindCount(0);
    setActiveMatch(0);
  };

  // Note linking
  const [showNoteLinkModal, setShowNoteLinkModal] = useState(false);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [noteLinkSearch, setNoteLinkSearch] = useState('');

  const handleInsertNoteLink = async () => {
    const notes = await window.electronAPI.getNotes();
    setAllNotes(notes.filter((n) => !n.deleted && n.id !== note.id));
    setShowNoteLinkModal(true);
    setNoteLinkSearch('');
  };

  const handleSelectNoteLink = (linkedNote: Note) => {
    if (!editor) return;
    editor.chain().focus().insertContent(
      `<a href="noteit://note/${linkedNote.id}" class="note-link">[[${linkedNote.title}]]</a>`
    ).run();
    setShowNoteLinkModal(false);
  };

  const resolvedColor = getColorHex(color, theme);

  return (
    <div className="note-editor" style={resolvedColor ? { backgroundColor: resolvedColor } : undefined}>
      <div className="editor-header">
        <div className="editor-header-left">
          <button className="btn btn-secondary" onClick={onBack}>
            <ArrowLeftIcon size={15} />
            Wróć
          </button>
        </div>
        <div className="editor-header-right">
          {saveStatus === 'saving' && <span className="save-indicator saving">Zapisywanie...</span>}
          {saveStatus === 'saved' && <span className="save-indicator saved">Zapisano</span>}
          <select
            className="control-select"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            title="Kolor notatki"
            aria-label="Kolor notatki"
          >
            {noteColors.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
          <button className="btn-icon" onClick={() => handleExport('md')} title="Eksportuj jako Markdown">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          <DateTimePicker
            value={reminder}
            onChange={(iso) => handleReminderChange(iso)}
            onClear={() => handleReminderChange('')}
          />
          <button className="btn-icon btn-delete" onClick={() => setConfirmDelete(true)} title="Usuń notatkę" aria-label="Usuń notatkę">
            <TrashIcon size={16} />
          </button>
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            title={theme === 'light' ? 'Ciemny motyw' : 'Jasny motyw'}
            aria-label={theme === 'light' ? 'Przełącz na ciemny motyw' : 'Przełącz na jasny motyw'}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </div>

      <input
        type="text"
        className="note-title-input"
        value={title}
        onChange={handleTitleChange}
        onBlur={handleTitleBlur}
        placeholder="Tytuł notatki..."
        maxLength={80}
      />

      {/* Tags */}
      <div className="tags-section">
        <div className="tags-list">
          {tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
              <button className="tag-remove" onClick={() => handleRemoveTag(tag)} aria-label={`Usuń tag ${tag}`}>&times;</button>
            </span>
          ))}
        </div>
        {tags.length < 3 && (
          <input
            type="text"
            className="tag-input"
            placeholder="Dodaj tag (Enter)..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
          />
        )}
      </div>

      {/* Find & Replace bar */}
      {showFind && (
        <div className="find-bar">
          <div className="find-bar-row">
            <button
              className={`btn-icon find-toggle-replace ${showReplace ? 'expanded' : ''}`}
              onClick={() => setShowReplace(!showReplace)}
              title="Pokaż zamień"
              aria-label="Pokaż zamień"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <input
              type="text"
              className="find-input"
              placeholder="Szukaj..."
              value={findText}
              onChange={(e) => { setFindText(e.target.value); setActiveMatch(0); }}
              onKeyDown={(e) => e.key === 'Enter' && handleFindNext()}
              autoFocus
            />
            {findCount > 0 && (
              <span className="find-count">{activeMatch + 1}/{findCount}</span>
            )}
            <button className="btn-icon" onClick={handleFindPrev} title="Poprzednie" disabled={findCount === 0}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
            </button>
            <button className="btn-icon" onClick={handleFindNext} title="Następne" disabled={findCount === 0}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <button className="btn-icon" onClick={closeFind} aria-label="Zamknij">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          {showReplace && (
            <div className="find-bar-row find-replace-row">
              <input
                type="text"
                className="find-input"
                placeholder="Zamień na..."
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReplace()}
              />
              <button className="btn btn-secondary btn-sm" onClick={handleReplace} disabled={findCount === 0}>Zamień</button>
              <button className="btn btn-secondary btn-sm" onClick={handleReplaceAll} disabled={findCount === 0}>Wszystkie</button>
            </div>
          )}
        </div>
      )}

      {editor && <Toolbar editor={editor} onInsertNoteLink={handleInsertNoteLink} />}

      <div className="editor-container" onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('.dtp-dropdown, .find-bar, input, select, button')) return;
        editor?.chain().focus().run();
      }}>
        <EditorContent editor={editor} />
      </div>

      <div className="editor-footer">
        <span className="hint">Ctrl+V wklej screenshot | Ctrl+F szukaj | Przeciągnij obraz</span>
        <span className="word-count">{wordCount} słów · {charCount} znaków</span>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Przenieść do kosza?</h3>
            <p>Notatka trafi do kosza na 30 dni.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(false)}>Anuluj</button>
              <button className="btn btn-danger" onClick={() => { setConfirmDelete(false); onDelete(); }}>Usuń</button>
            </div>
          </div>
        </div>
      )}

      {/* Note link modal */}
      {showNoteLinkModal && (
        <div className="modal-overlay" onClick={() => setShowNoteLinkModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <h3>Link do notatki</h3>
            <input
              type="text"
              className="find-input"
              placeholder="Szukaj notatki..."
              value={noteLinkSearch}
              onChange={(e) => setNoteLinkSearch(e.target.value)}
              autoFocus
              style={{ marginBottom: '12px' }}
            />
            <div className="note-link-list">
              {allNotes
                .filter((n) => n.title.toLowerCase().includes(noteLinkSearch.toLowerCase()))
                .slice(0, 10)
                .map((n) => (
                  <button
                    key={n.id}
                    className="note-link-item"
                    onClick={() => handleSelectNoteLink(n)}
                  >
                    {n.title}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoteEditor;
