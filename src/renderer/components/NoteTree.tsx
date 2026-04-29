import React, { useState } from 'react';
import { Note } from '../types';

interface Props {
  notes: Note[];
  onSelect: (note: Note) => void;
  onCreateChild: (parentId: string) => void;
  onMoveToRoot: (noteId: string) => void;
  onMoveToParent: (noteId: string, parentId: string) => void;
}

interface TreeNode {
  note: Note;
  children: TreeNode[];
}

function buildTree(notes: Note[]): TreeNode[] {
  const activeNotes = notes.filter((n) => !n.deleted);
  const map = new Map<string, TreeNode>();

  // Create nodes
  for (const note of activeNotes) {
    map.set(note.id, { note, children: [] });
  }

  // Build hierarchy
  const roots: TreeNode[] = [];
  for (const note of activeNotes) {
    const node = map.get(note.id)!;
    if (note.parentId && map.has(note.parentId)) {
      const parent = map.get(note.parentId)!;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Sort children by childrenOrder
  for (const note of activeNotes) {
    const node = map.get(note.id)!;
    if (note.childrenOrder && note.childrenOrder.length > 0) {
      node.children.sort((a, b) => {
        const aIdx = note.childrenOrder!.indexOf(a.note.id);
        const bIdx = note.childrenOrder!.indexOf(b.note.id);
        return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
      });
    }
  }

  return roots.sort((a, b) => new Date(b.note.updatedAt).getTime() - new Date(a.note.updatedAt).getTime());
}

function TreeItem({ node, depth, onSelect, onCreateChild, onMoveToRoot, onDragStart, onDrop }: {
  node: TreeNode;
  depth: number;
  onSelect: (note: Note) => void;
  onCreateChild: (parentId: string) => void;
  onMoveToRoot: (noteId: string) => void;
  onDragStart: (e: React.DragEvent, noteId: string) => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const hasChildren = node.children.length > 0;

  return (
    <div className="tree-item-wrapper">
      <div
        className={`tree-item ${dragOver ? 'drag-over' : ''}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        draggable
        onDragStart={(e) => onDragStart(e, node.note.id)}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); onDrop(e, node.note.id); }}
      >
        <button
          className={`tree-expand ${hasChildren ? '' : 'invisible'} ${expanded ? 'expanded' : ''}`}
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          aria-label={expanded ? 'Zwiń' : 'Rozwiń'}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <span className="tree-item-title" onClick={() => onSelect(node.note)}>
          {node.note.title || 'Bez tytułu'}
        </span>
        <div className="tree-item-actions">
          <button
            className="tree-action-btn"
            onClick={(e) => { e.stopPropagation(); onCreateChild(node.note.id); }}
            title="Dodaj podnotatkę"
            aria-label="Dodaj podnotatkę"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          {node.note.parentId && (
            <button
              className="tree-action-btn"
              onClick={(e) => { e.stopPropagation(); onMoveToRoot(node.note.id); }}
              title="Przenieś na główny poziom"
              aria-label="Przenieś na główny poziom"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
            </button>
          )}
        </div>
      </div>
      {hasChildren && expanded && (
        <div className="tree-children">
          {node.children.map((child) => (
            <TreeItem
              key={child.note.id}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              onCreateChild={onCreateChild}
              onMoveToRoot={onMoveToRoot}
              onDragStart={onDragStart}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NoteTree({ notes, onSelect, onCreateChild, onMoveToRoot, onMoveToParent }: Props) {
  const tree = buildTree(notes);

  const handleDragStart = (e: React.DragEvent, noteId: string) => {
    e.dataTransfer.setData('treeNoteId', noteId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    const noteId = e.dataTransfer.getData('treeNoteId');
    if (noteId && noteId !== targetId) {
      onMoveToParent(noteId, targetId);
    }
  };

  return (
    <div className="note-tree">
      <div className="note-tree-header">
        <span>Struktura</span>
      </div>
      <div className="note-tree-content">
        {tree.map((node) => (
          <TreeItem
            key={node.note.id}
            node={node}
            depth={0}
            onSelect={onSelect}
            onCreateChild={onCreateChild}
            onMoveToRoot={onMoveToRoot}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  );
}

export default NoteTree;
