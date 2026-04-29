import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';

interface Props {
  editor: Editor;
}

interface Heading {
  level: number;
  text: string;
  pos: number;
}

function TableOfContents({ editor }: Props) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateHeadings = () => {
      const items: Heading[] = [];
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          items.push({
            level: node.attrs.level,
            text: node.textContent,
            pos,
          });
        }
      });
      setHeadings(items);
    };

    updateHeadings();
    editor.on('update', updateHeadings);
    return () => { editor.off('update', updateHeadings); };
  }, [editor]);

  if (headings.length === 0) return null;

  const scrollToHeading = (pos: number) => {
    editor.chain().focus().setTextSelection(pos + 1).run();
    // Scroll into view
    const domAtPos = editor.view.domAtPos(pos + 1);
    if (domAtPos.node) {
      const element = domAtPos.node instanceof HTMLElement ? domAtPos.node : domAtPos.node.parentElement;
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="toc-wrapper">
      <button
        className={`btn-icon toc-toggle ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Spis treści"
        aria-label="Spis treści"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/>
        </svg>
      </button>
      {isOpen && (
        <div className="toc-panel">
          <div className="toc-header">Spis treści</div>
          <div className="toc-items">
            {headings.map((h, i) => (
              <button
                key={i}
                className={`toc-item toc-level-${h.level}`}
                onClick={() => scrollToHeading(h.pos)}
              >
                {h.text || 'Bez tytułu'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TableOfContents;
