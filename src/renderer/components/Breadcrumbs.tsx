import React from 'react';
import { Note } from '../types';

interface Props {
  note: Note;
  allNotes: Note[];
  onNavigate: (noteId: string) => void;
}

function Breadcrumbs({ note, allNotes, onNavigate }: Props) {
  // Build path from root to current note
  const path: Note[] = [];
  let current: Note | undefined = note;

  while (current?.parentId) {
    const parent = allNotes.find((n) => n.id === current!.parentId);
    if (parent) {
      path.unshift(parent);
      current = parent;
    } else {
      break;
    }
  }

  if (path.length === 0) return null;

  return (
    <div className="breadcrumbs">
      {path.map((p, i) => (
        <React.Fragment key={p.id}>
          <button className="breadcrumb-item" onClick={() => onNavigate(p.id)}>
            {p.title || 'Bez tytułu'}
          </button>
          <span className="breadcrumb-sep">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </span>
        </React.Fragment>
      ))}
      <span className="breadcrumb-current">{note.title || 'Bez tytułu'}</span>
    </div>
  );
}

export default Breadcrumbs;
