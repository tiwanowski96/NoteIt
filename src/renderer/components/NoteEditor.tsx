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
import EmojiPicker from './EmojiPicker';
import TableOfContents from './TableOfContents';
import Breadcrumbs from './Breadcrumbs';
import NoteChildren from './NoteChildren';
import SlashCommands from './SlashCommands';
import { LockModal, RemoveLockModal } from './LockNote';
import { useLang } from '../LangContext';

interface Props {
  note: Note;
  onSave: (note: Note) => void;
  onBack: () => void;
  onDelete: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  alwaysOnTop: boolean;
  onToggleAlwaysOnTop: () => void;
  allNotes?: Note[];
  onNavigateNote?: (noteId: string) => void;
  onCreateChild?: (parentId: string) => void;
}

function getColorHex(colorKey: string, currentTheme: 'light' | 'dark'): string {
  const noteColors = [
    { label: '', key: '', light: '', dark: '' },
    { label: '', key: 'red', light: '#fef2f2', dark: '#3b1c1c' },
    { label: '', key: 'blue', light: '#eff6ff', dark: '#1c2a3b' },
    { label: '', key: 'green', light: '#f0fdf4', dark: '#1c3b24' },
    { label: '', key: 'yellow', light: '#fefce8', dark: '#3b3a1c' },
    { label: '', key: 'purple', light: '#faf5ff', dark: '#2d1c3b' },
    { label: '', key: 'orange', light: '#fff7ed', dark: '#3b2a1c' },
  ];
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

function NoteEditor({ note, onSave, onBack, onDelete, theme, onToggleTheme, alwaysOnTop, onToggleAlwaysOnTop, allNotes, onNavigateNote, onCreateChild }: Props) {
  const { t } = useLang();
  const [title, setTitle] = useState(note.title);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [color, setColor] = useState(note.color || '');
  const [reminder, setReminder] = useState(note.reminder || '');
  const [isLocked, setIsLocked] = useState(!!note.locked);
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
  const [showEmoji, setShowEmoji] = useState(false);
  const [localFontSize, setLocalFontSize] = useState(() => {
    const saved = localStorage.getItem('noteit-editor-font-size');
    return saved ? Number(saved) : 15;
  });
  const [slashCommand, setSlashCommand] = useState<{ top: number; left: number } | null>(null);
  const [showLockModal, setShowLockModal] = useState(false);
  const [showRemoveLockModal, setShowRemoveLockModal] = useState(false);
  const [removeLockError, setRemoveLockError] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const noteColors = [
    { label: t('colorNone'), key: '', light: '', dark: '' },
    { label: t('colorRed'), key: 'red', light: '#fef2f2', dark: '#3b1c1c' },
    { label: t('colorBlue'), key: 'blue', light: '#eff6ff', dark: '#1c2a3b' },
    { label: t('colorGreen'), key: 'green', light: '#f0fdf4', dark: '#1c3b24' },
    { label: t('colorYellow'), key: 'yellow', light: '#fefce8', dark: '#3b3a1c' },
    { label: t('colorPurple'), key: 'purple', light: '#faf5ff', dark: '#2d1c3b' },
    { label: t('colorOrange'), key: 'orange', light: '#fff7ed', dark: '#3b2a1c' },
  ];

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
        autolink: true,
        linkOnPaste: true,
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
    onTransaction: ({ editor, transaction }) => {
      // Detect "/" typed at beginning of line or after space
      if (!transaction.docChanged) return;
      const { from } = editor.state.selection;
      const textBefore = editor.state.doc.textBetween(Math.max(0, from - 1), from);
      if (textBefore === '/') {
        // Check if it's at start of block or after whitespace
        const charBeforeSlash = from > 1 ? editor.state.doc.textBetween(from - 2, from - 1) : '';
        if (charBeforeSlash === '' || charBeforeSlash === ' ' || charBeforeSlash === '\n' || from <= 1) {
          // Get cursor position on screen
          const coords = editor.view.coordsAtPos(from);
          const editorRect = editor.view.dom.closest('.editor-container')?.getBoundingClientRect();
          if (editorRect) {
            setSlashCommand({
              top: coords.bottom - editorRect.top + 4,
              left: coords.left - editorRect.left,
            });
          }
        }
      } else if (slashCommand) {
        // Close if user typed something else or moved away
        const textCheck = editor.state.doc.textBetween(Math.max(0, from - 20), from);
        if (!textCheck.includes('/')) {
          setSlashCommand(null);
        }
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

      // Check for tab-separated data (Excel/Sheets paste)
      const text = event.clipboardData?.getData('text/plain') || '';
      if (text.includes('\t') && text.includes('\n')) {
        const rows = text.trim().split('\n').map((row) => row.split('\t'));
        if (rows.length >= 2 && rows[0].length >= 2) {
          event.preventDefault();
          event.stopImmediatePropagation();
          // Build table HTML
          const headerRow = rows[0].map((cell) => `<th>${cell}</th>`).join('');
          const bodyRows = rows.slice(1).map((row) =>
            `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`
          ).join('');
          const tableHtml = `<table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>`;
          editor.chain().focus().insertContent(tableHtml).run();
          return;
        }
      }

      // Check for images
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          event.preventDefault();
          event.stopImmediatePropagation();
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
    editorElement.addEventListener('paste', handlePaste, true);
    editorElement.addEventListener('drop', handleDrop);
    return () => {
      editorElement.removeEventListener('paste', handlePaste, true);
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

  // Save editor font size
  useEffect(() => {
    localStorage.setItem('noteit-editor-font-size', String(localFontSize));
  }, [localFontSize]);

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
    const newTags = tags.filter((tg) => tg !== tagToRemove);
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
  const [linkableNotes, setLinkableNotes] = useState<Note[]>([]);
  const [noteLinkSearch, setNoteLinkSearch] = useState('');

  const handleInsertNoteLink = async () => {
    const notes = await window.electronAPI.getNotes();
    setLinkableNotes(notes.filter((n) => !n.deleted && n.id !== note.id));
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
            {t('back')}
          </button>
        </div>
        <div className="editor-header-right">
          {saveStatus === 'saving' && <span className="save-indicator saving">Zapisywanie...</span>}
          {saveStatus === 'saved' && <span className="save-indicator saved">Zapisano</span>}
          <select
            className="control-select"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            title={t('colorNone')}
            aria-label={t('colorNone')}
          >
            {noteColors.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
          <button className="btn-icon" onClick={() => handleExport('md')} title={t('exportMd')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          <DateTimePicker
            value={reminder}
            onChange={(iso) => handleReminderChange(iso)}
            onClear={() => handleReminderChange('')}
          />
          <button className="btn-icon btn-delete" onClick={() => setConfirmDelete(true)} title={t('deleteNote')} aria-label={t('deleteNote')}>
            <TrashIcon size={16} />
          </button>
          <button
            className={`btn-icon ${isLocked ? 'reminder-active' : ''}`}
            onClick={() => {
              if (isLocked) {
                setShowRemoveLockModal(true);
              } else {
                setShowLockModal(true);
              }
            }}
            title={isLocked ? t('unlockNote') : t('lockNote')}
            aria-label={isLocked ? t('unlockNote') : t('lockNote')}
          >
            {isLocked ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 5-5 5 5 0 0 1 5 5"/>
              </svg>
            )}
          </button>
          <button
            className={`btn-icon ${alwaysOnTop ? 'reminder-active' : ''}`}
            onClick={onToggleAlwaysOnTop}
            title={t('alwaysOnTop')}
            aria-label={t('alwaysOnTop')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={alwaysOnTop ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C9.243 2 7 4.243 7 7c0 2.475 1.639 4.57 3.89 5.271L12 22l1.11-9.729C15.361 11.57 17 9.475 17 7c0-2.757-2.243-5-5-5z"/>
            </svg>
          </button>
          <button
            className="btn-icon"
            onClick={() => window.electronAPI.openStickyNote(note.id)}
            title={t('stickyNote')}
            aria-label={t('stickyNote')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M14 3v4a2 2 0 0 0 2 2h4"/>
            </svg>
          </button>
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            title={theme === 'light' ? t('darkTheme') : t('lightTheme')}
            aria-label={theme === 'light' ? t('darkTheme') : t('lightTheme')}
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
        placeholder={t('noteTitle')}
        maxLength={80}
      />

      {/* Breadcrumbs */}
      {allNotes && note.parentId && (
        <Breadcrumbs
          note={note}
          allNotes={allNotes}
          onNavigate={(id) => onNavigateNote?.(id)}
        />
      )}

      {/* Tags */}
      <div className="tags-section">
        <div className="tags-list">
          {tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
              <button className="tag-remove" onClick={() => handleRemoveTag(tag)} aria-label={`${t('remove')} ${tag}`}>&times;</button>
            </span>
          ))}
        </div>
        {tags.length < 3 && (
          <input
            type="text"
            className="tag-input"
            placeholder={t('addTag')}
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
              title={t('replace')}
              aria-label={t('replace')}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <input
              type="text"
              className="find-input"
              placeholder={t('searchInNote')}
              value={findText}
              onChange={(e) => { setFindText(e.target.value); setActiveMatch(0); }}
              onKeyDown={(e) => e.key === 'Enter' && handleFindNext()}
              autoFocus
            />
            {findCount > 0 && (
              <span className="find-count">{activeMatch + 1}/{findCount}</span>
            )}
            <button className="btn-icon" onClick={handleFindPrev} title={t('next')} disabled={findCount === 0}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
            </button>
            <button className="btn-icon" onClick={handleFindNext} title={t('next')} disabled={findCount === 0}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <button className="btn-icon" onClick={closeFind} aria-label={t('close')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          {showReplace && (
            <div className="find-bar-row find-replace-row">
              <input
                type="text"
                className="find-input"
                placeholder={t('replaceWith')}
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReplace()}
              />
              <button className="btn btn-secondary btn-sm" onClick={handleReplace} disabled={findCount === 0}>{t('replace')}</button>
              <button className="btn btn-secondary btn-sm" onClick={handleReplaceAll} disabled={findCount === 0}>{t('replaceAll')}</button>
            </div>
          )}
        </div>
      )}

      {editor && (
        <div className="editor-toolbar-row">
          <Toolbar editor={editor} onInsertNoteLink={handleInsertNoteLink} />
          <div className="toolbar-extras">
            <div className="emoji-wrapper">
              <button
                className="btn-icon"
                onClick={() => setShowEmoji(!showEmoji)}
                title={t('emoji')}
                aria-label={t('emoji')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </button>
              {showEmoji && (
                <EmojiPicker
                  onSelect={(emoji) => editor.chain().focus().insertContent(emoji).run()}
                  onClose={() => setShowEmoji(false)}
                />
              )}
            </div>
            <TableOfContents editor={editor} />
            <div className="font-size-inline">
              <button className="btn-icon" onClick={() => setLocalFontSize(Math.max(12, localFontSize - 1))} title="A-">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <span className="font-size-inline-value">{localFontSize}</span>
              <button className="btn-icon" onClick={() => setLocalFontSize(Math.min(22, localFontSize + 1))} title="A+">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="editor-container" style={{ fontSize: `${localFontSize}px` }} onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('.dtp-dropdown, .find-bar, input, select, button')) return;
        editor?.chain().focus().run();
      }}>
        <EditorContent editor={editor} />
        {slashCommand && editor && (
          <SlashCommands
            editor={editor}
            position={slashCommand}
            onClose={() => setSlashCommand(null)}
          />
        )}
      </div>

      {/* Children notes */}
      {allNotes && (
        <NoteChildren
          note={note}
          allNotes={allNotes}
          onSelect={(id) => onNavigateNote?.(id)}
          onCreateChild={(parentId) => onCreateChild?.(parentId)}
          onMoveToRoot={(id) => {}}
        />
      )}

      <div className="editor-footer">
        <span className="hint">{t('pasteScreenshot')}</span>
        <span className="word-count">{wordCount} {t('words')} · {charCount} {t('chars')}</span>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t('moveToTrash')}</h3>
            <p>{t('trashInfo')}</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(false)}>{t('cancel')}</button>
              <button className="btn btn-danger" onClick={() => { setConfirmDelete(false); onDelete(); }}>{t('delete')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Lock modal */}
      {showLockModal && (
        <LockModal
          onLock={async (pin) => {
            await window.electronAPI.lockNote(note.id, pin);
            setIsLocked(true);
            setShowLockModal(false);
          }}
          onClose={() => setShowLockModal(false)}
        />
      )}

      {/* Remove lock modal */}
      {showRemoveLockModal && (
        <RemoveLockModal
          error={removeLockError}
          onRemove={async (pin) => {
            const ok = await window.electronAPI.unlockNote(note.id, pin);
            if (ok) {
              await window.electronAPI.removeLock(note.id);
              setIsLocked(false);
              setShowRemoveLockModal(false);
              setRemoveLockError(false);
            } else {
              setRemoveLockError(true);
            }
          }}
          onClose={() => { setShowRemoveLockModal(false); setRemoveLockError(false); }}
        />
      )}

      {/* Note link modal */}
      {showNoteLinkModal && (
        <div className="modal-overlay" onClick={() => setShowNoteLinkModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <h3>{t('noteLink')}</h3>
            <input
              type="text"
              className="find-input"
              placeholder={t('searchNotePlaceholder')}
              value={noteLinkSearch}
              onChange={(e) => setNoteLinkSearch(e.target.value)}
              autoFocus
              style={{ marginBottom: '12px' }}
            />
            <div className="note-link-list">
              {linkableNotes
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
