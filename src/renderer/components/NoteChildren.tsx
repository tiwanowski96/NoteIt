import React from 'react';
import { Note } from '../types';

interface Props {
  note: Note;
  allNotes: Note[];
  onSelect: (noteId: string) => void;
  onCreateChild: (parentId: string) => void;
  onMoveToRoot: (noteId: string) => void;
}

function NoteChildren({ note, allNotes, onSelect, onCreateChild, onMoveToRoot }: Props) {
  const children = allNotes.filter((n) => n.parentId === note.id && !n.deleted);

  // Sort by childrenOrder
  const sorted = note.childrenOrder && note.childrenOrder.length > 0
    ? [...children].sort((a, b) => {
        const aIdx = note.childrenOrder!.indexOf(a.id);
        const bIdx = note.childrenOrder!.indexOf(b.id);
        return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
      })
    : children.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="note-children">
      <div className="note-children-header">
        <span className="note-children-title">Podnotatki</span>
        <button
          className="btn-icon"
          onClick={() => onCreateChild(note.id)}
          title="Dodaj podnotatkę"
          aria-label="Dodaj podnotatkę"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
      {sorted.length === 0 ? (
        <p className="note-children-empty">Brak podnotatek</p>
      ) : (
        <div className="note-children-list">
          {sorted.map((child) => {
            const grandchildren = allNotes.filter((n) => n.parentId === child.id && !n.deleted);
            return (
              <button
                key={child.id}
                className="note-child-item"
                onClick={() => onSelect(child.id)}
              >
                <span className="note-child-title">{child.title || 'Bez tytułu'}</span>
                {grandchildren.length > 0 && (
                  <span className="note-child-count">{grandchildren.length}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NoteChildren;
