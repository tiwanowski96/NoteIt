import React, { useState, useEffect, useRef } from 'react';

interface Props {
  mode: 'work' | 'break';
  timeLeft: number;
  isRunning: boolean;
  onToggleRunning: () => void;
  onExpand: () => void;
  onClose: () => void;
}

function PomodoroMini({ mode, timeLeft, isRunning, onToggleRunning, onExpand, onClose }: Props) {
  const [position, setPosition] = useState({ x: window.innerWidth - 200, y: 20 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setDragging(true);
    setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 180, e.clientX - dragOffset.x)),
        y: Math.max(0, Math.min(window.innerHeight - 50, e.clientY - dragOffset.y)),
      });
    };
    const handleMouseUp = () => setDragging(false);

    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragOffset]);

  return (
    <div
      className="pomodoro-mini"
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
    >
      <span className={`pomodoro-mini-mode ${mode}`}>{mode === 'work' ? 'P' : 'O'}</span>
      <span className="pomodoro-mini-time">{formatTime(timeLeft)}</span>
      <button className="pomodoro-mini-btn" onClick={onToggleRunning}>
        {isRunning ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        )}
      </button>
      <button className="pomodoro-mini-btn" onClick={onExpand} title="Rozwiń">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/></svg>
      </button>
      <button className="pomodoro-mini-btn" onClick={onClose} title="Zamknij">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  );
}

export default PomodoroMini;
