import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';

interface Props {
  editor: Editor;
  position: { top: number; left: number };
  onClose: () => void;
}

interface Command {
  id: string;
  label: string;
  description: string;
  icon: JSX.Element;
  action: (editor: Editor) => void;
}

const commands: Command[] = [
  {
    id: 'h1',
    label: 'Nagłówek 1',
    description: 'Duży nagłówek',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h8M4 18V6M12 18V6M17 12l3-2v8"/></svg>,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: 'h2',
    label: 'Nagłówek 2',
    description: 'Średni nagłówek',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h8M4 18V6M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/></svg>,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: 'h3',
    label: 'Nagłówek 3',
    description: 'Mały nagłówek',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h8M4 18V6M12 18V6"/><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2m2 0a2 2 0 0 1-2 2c-1.7 0-3.5-1-3.5-1"/></svg>,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    id: 'bullet',
    label: 'Lista punktowana',
    description: 'Lista z kropkami',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>,
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: 'ordered',
    label: 'Lista numerowana',
    description: 'Lista 1, 2, 3...',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="3" y="8" fontSize="7" fill="currentColor" stroke="none">1</text><text x="3" y="14" fontSize="7" fill="currentColor" stroke="none">2</text><text x="3" y="20" fontSize="7" fill="currentColor" stroke="none">3</text></svg>,
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: 'task',
    label: 'Checklista',
    description: 'Lista z checkboxami',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    action: (editor) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    id: 'table',
    label: 'Tabela',
    description: 'Wstaw tabelę 3x3',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>,
    action: (editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    id: 'quote',
    label: 'Cytat',
    description: 'Blok cytatu',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/></svg>,
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    id: 'code',
    label: 'Blok kodu',
    description: 'Fragment kodu',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
    action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    id: 'hr',
    label: 'Linia pozioma',
    description: 'Separator',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="2" y1="12" x2="22" y2="12"/></svg>,
    action: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    id: 'image',
    label: 'Obraz',
    description: 'Wstaw z URL',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    action: (editor) => {
      const url = prompt('URL obrazu:');
      if (url) editor.chain().focus().setImage({ src: url }).run();
    },
  },
];

function SlashCommands({ editor, position, onClose }: Props) {
  const [filter, setFilter] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(filter.toLowerCase()) ||
    cmd.description.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [filter]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => {
          const next = Math.min(i + 1, filtered.length - 1);
          setTimeout(() => {
            const el = document.querySelector('.slash-command-item.selected');
            el?.scrollIntoView({ block: 'nearest' });
          }, 0);
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => {
          const next = Math.max(i - 1, 0);
          setTimeout(() => {
            const el = document.querySelector('.slash-command-item.selected');
            el?.scrollIntoView({ block: 'nearest' });
          }, 0);
          return next;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          executeCommand(filtered[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Backspace' && filter === '') {
        onClose();
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        setFilter((f) => f + e.key);
      } else if (e.key === 'Backspace') {
        setFilter((f) => f.slice(0, -1));
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [filtered, selectedIndex, filter]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function executeCommand(cmd: Command) {
    // Delete the "/" character that triggered this
    const { from } = editor.state.selection;
    editor.chain().deleteRange({ from: from - 1 - filter.length, to: from }).run();
    cmd.action(editor);
    onClose();
  }

  return (
    <div
      ref={ref}
      className="slash-commands"
      style={{ top: position.top, left: position.left }}
    >
      {filter && <div className="slash-filter">/{filter}</div>}
      <div className="slash-commands-list">
        {filtered.length === 0 ? (
          <div className="slash-empty">Brak wyników</div>
        ) : (
          filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              className={`slash-command-item ${i === selectedIndex ? 'selected' : ''}`}
              onClick={() => executeCommand(cmd)}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <span className="slash-command-icon">{cmd.icon}</span>
              <div className="slash-command-text">
                <span className="slash-command-label">{cmd.label}</span>
                <span className="slash-command-desc">{cmd.description}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default SlashCommands;
