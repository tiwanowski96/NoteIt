import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../types';

interface Props {
  notes: Note[];
  onSelect: (note: Note) => void;
  onClose: () => void;
}

function CommandPalette({ notes, onSelect, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeNotes = notes.filter((n) => !n.deleted);

  const filtered = query
    ? activeNotes.filter((n) =>
        n.title.toLowerCase().includes(query.toLowerCase()) ||
        (n.tags || []).some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : activeNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 10);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
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
            placeholder="Szukaj notatki..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="command-palette-results">
          {filtered.length === 0 ? (
            <div className="command-palette-empty">Brak wyników</div>
          ) : (
            filtered.slice(0, 10).map((note, i) => (
              <button
                key={note.id}
                className={`command-palette-item ${i === selectedIndex ? 'selected' : ''}`}
                onClick={() => onSelect(note)}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <span className="command-palette-item-title">{note.title}</span>
                <span className="command-palette-item-date">
                  {new Date(note.updatedAt).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })}
                </span>
              </button>
            ))
          )}
        </div>
        <div className="command-palette-footer">
          <span><kbd>↑↓</kbd> nawiguj</span>
          <span><kbd>Enter</kbd> otwórz</span>
          <span><kbd>Esc</kbd> zamknij</span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
