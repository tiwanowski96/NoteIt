import React from 'react';
import { Note } from '../types';
import { useLang } from '../LangContext';

interface Props {
  notes: Note[];
  onSelect: (note: Note) => void;
  onStatusChange: (noteId: string, status: 'todo' | 'inprogress' | 'done') => void;
}

function KanbanView({ notes, onSelect, onStatusChange }: Props) {
  const { t } = useLang();

  const columns: { key: 'todo' | 'inprogress' | 'done'; label: string }[] = [
    { key: 'todo', label: t('kanbanTodo') },
    { key: 'inprogress', label: t('kanbanInProgress') },
    { key: 'done', label: t('kanbanDone') },
  ];

  const handleDragStart = (e: React.DragEvent, noteId: string) => {
    e.dataTransfer.setData('noteId', noteId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: 'todo' | 'inprogress' | 'done') => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData('noteId');
    if (noteId) {
      onStatusChange(noteId, status);
    }
  };

  function stripHtml(html: string) {
    return html
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/p>/gi, ' ')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  return (
    <div className="kanban-board">
      {columns.map((col) => {
        const columnNotes = notes.filter((n) => (n.kanbanStatus || 'todo') === col.key);
        return (
          <div
            key={col.key}
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.key)}
          >
            <div className="kanban-column-header">
              <span className="kanban-column-title">{col.label}</span>
              <span className="kanban-column-count">{columnNotes.length}</span>
            </div>
            <div className="kanban-column-cards">
              {columnNotes.map((note) => (
                <div
                  key={note.id}
                  className="kanban-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, note.id)}
                  onClick={() => onSelect(note)}
                >
                  <h4>{note.title || t('untitled')}</h4>
                  <p>{stripHtml(note.content).slice(0, 60)}</p>
                  {(note.tags || []).length > 0 && (
                    <div className="kanban-card-tags">
                      {(note.tags || []).map((tag) => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default KanbanView;
