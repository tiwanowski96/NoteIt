import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../types';
import { useLang } from '../LangContext';

interface Props {
  notes: Note[];
  onSelect: (note: Note) => void;
  onClose: () => void;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<\/h[1-6]>/gi, ' ')
    .replace(/<\/li>/gi, ' ')
    .replace(/<\/div>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function getSnippet(content: string, query: string, maxLen: number = 120): string {
  const text = stripHtml(content);
  if (!query) return text.slice(0, maxLen);

  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, maxLen);

  const start = Math.max(0, idx - 30);
  const end = Math.min(text.length, idx + query.length + 90);
  let snippet = text.slice(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  return snippet;
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="search-highlight">{part}</mark> : part
  );
}

function CommandPalette({ notes, onSelect, onClose }: Props) {
  const { t } = useLang();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const activeNotes = notes.filter((n) => !n.deleted);

  const filtered = query
    ? activeNotes.filter((n) => {
        const q = query.toLowerCase();
        const titleMatch = n.title.toLowerCase().includes(q);
        const contentMatch = stripHtml(n.content).toLowerCase().includes(q);
        const tagMatch = (n.tags || []).some((tag) => tag.toLowerCase().includes(q));
        return titleMatch || contentMatch || tagMatch;
      })
    : activeNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 10);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selected = resultsRef.current.querySelector('.command-palette-item.selected');
      if (selected) {
        selected.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, Math.min(filtered.length - 1, 19)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      onSelect(filtered[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <div className="command-palette-input-wrapper">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="command-palette-icon">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            placeholder={t('searchNotePlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <span className="command-palette-count">{filtered.length}</span>
          )}
        </div>
        <div className="command-palette-results" ref={resultsRef}>
          {filtered.length === 0 ? (
            <div className="command-palette-empty">{t('noResultsPalette')}</div>
          ) : (
            filtered.slice(0, 20).map((note, i) => (
              <button
                key={note.id}
                className={`command-palette-item ${i === selectedIndex ? 'selected' : ''}`}
                onClick={() => onSelect(note)}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <div className="command-palette-item-top">
                  <span className="command-palette-item-title">
                    {note.locked && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: 'middle', opacity: 0.5 }}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    )}
                    {highlightMatch(note.title || t('untitled'), query)}
                  </span>
                  <span className="command-palette-item-date">
                    {new Date(note.updatedAt).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
                {query && !note.locked && (
                  <div className="command-palette-item-preview">
                    {highlightMatch(getSnippet(note.content, query), query)}
                  </div>
                )}
                {(note.tags || []).length > 0 && (
                  <div className="command-palette-item-tags">
                    {(note.tags || []).map((tag) => (
                      <span key={tag} className="command-palette-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
        <div className="command-palette-footer">
          <span><kbd>↑↓</kbd> {t('navigate')}</span>
          <span><kbd>Enter</kbd> {t('open')}</span>
          <span><kbd>Esc</kbd> {t('close')}</span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
