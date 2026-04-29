import React from 'react';
import { Note } from '../types';

interface Props {
  notes: Note[];
  onClose: () => void;
}

function Stats({ notes, onClose }: Props) {
  const activeNotes = notes.filter((n) => !n.deleted);
  const totalNotes = activeNotes.length;
  const totalWords = activeNotes.reduce((sum, n) => {
    const text = n.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    return sum + (text ? text.split(/\s+/).length : 0);
  }, 0);
  const totalTags = new Set(activeNotes.flatMap((n) => n.tags || [])).size;
  const pinnedCount = activeNotes.filter((n) => n.pinned).length;

  // Activity last 7 days
  const now = new Date();
  const weekActivity = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - i));
    const dayStr = date.toISOString().slice(0, 10);
    const count = activeNotes.filter((n) => n.updatedAt.slice(0, 10) === dayStr).length;
    return {
      day: date.toLocaleDateString('pl-PL', { weekday: 'short' }),
      count,
    };
  });

  const maxActivity = Math.max(...weekActivity.map((d) => d.count), 1);

  // Streak
  let streak = 0;
  const checkDate = new Date(now);
  while (true) {
    const dayStr = checkDate.toISOString().slice(0, 10);
    const hasActivity = activeNotes.some(
      (n) => n.updatedAt.slice(0, 10) === dayStr || n.createdAt.slice(0, 10) === dayStr
    );
    if (hasActivity) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-stats" onClick={(e) => e.stopPropagation()}>
        <h3>Statystyki</h3>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{totalNotes}</span>
            <span className="stat-label">Notatek</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{totalWords}</span>
            <span className="stat-label">Słów</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{totalTags}</span>
            <span className="stat-label">Tagów</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{streak}</span>
            <span className="stat-label">Dni streak</span>
          </div>
        </div>

        <div className="stats-section">
          <h4>Aktywność (7 dni)</h4>
          <div className="activity-chart">
            {weekActivity.map((d, i) => (
              <div key={i} className="activity-bar-wrapper">
                <div
                  className="activity-bar"
                  style={{ height: `${(d.count / maxActivity) * 100}%` }}
                  title={`${d.count} notatek`}
                />
                <span className="activity-day">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-section">
          <div className="stats-row">
            <span>Przypięte</span>
            <span>{pinnedCount}</span>
          </div>
          <div className="stats-row">
            <span>W koszu</span>
            <span>{notes.filter((n) => n.deleted).length}</span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>Zamknij</button>
        </div>
      </div>
    </div>
  );
}

export default Stats;
