import React from 'react';
import { Note } from '../types';
import { useLang } from '../LangContext';

interface Props {
  notes: Note[];
  onClose: () => void;
}

function Stats({ notes, onClose }: Props) {
  const { t, pluralizeNotes } = useLang();
  const activeNotes = notes.filter((n) => !n.deleted);
  const totalNotes = activeNotes.length;
  const totalWords = activeNotes.reduce((sum, n) => {
    const text = n.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    return sum + (text ? text.split(/\s+/).length : 0);
  }, 0);
  const totalTags = new Set(activeNotes.flatMap((n) => n.tags || [])).size;
  const pinnedCount = activeNotes.filter((n) => n.pinned).length;

  function toLocalDateStr(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function todayLocalStr(offset: number = 0): string {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // Activity last 7 days
  const now = new Date();
  const weekActivity = Array.from({ length: 7 }).map((_, i) => {
    const dayStr = todayLocalStr(i - 6);
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - i));
    const count = activeNotes.filter((n) =>
      toLocalDateStr(n.updatedAt) === dayStr || toLocalDateStr(n.createdAt) === dayStr
    ).length;
    return {
      day: date.toLocaleDateString('pl-PL', { weekday: 'short' }),
      count,
    };
  });

  const maxActivity = Math.max(...weekActivity.map((d) => d.count), 1);

  // Streak
  let streak = 0;
  let dayOffset = 0;
  while (true) {
    const dayStr = todayLocalStr(-dayOffset);
    const hasActivity = activeNotes.some(
      (n) => toLocalDateStr(n.updatedAt) === dayStr || toLocalDateStr(n.createdAt) === dayStr
    );
    if (hasActivity) {
      streak++;
      dayOffset++;
    } else {
      break;
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-stats" onClick={(e) => e.stopPropagation()}>
        <h3>{t('statistics')}</h3>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{totalNotes}</span>
            <span className="stat-label">{t('totalNotes')}</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{totalWords}</span>
            <span className="stat-label">{t('totalWords')}</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{totalTags}</span>
            <span className="stat-label">{t('totalTags')}</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{streak}</span>
            <span className="stat-label">{t('streak')}</span>
          </div>
        </div>

        <div className="stats-section">
          <h4>{t('activity7')}</h4>
          <div className="activity-chart">
            {weekActivity.map((d, i) => (
              <div key={i} className="activity-bar-wrapper">
                <div
                  className="activity-bar"
                  style={{ height: `${(d.count / maxActivity) * 100}%` }}
                  title={`${d.count} ${pluralizeNotes(d.count)}`}
                />
                <span className="activity-day">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-section">
          <div className="stats-row">
            <span>{t('pinned')}</span>
            <span>{pinnedCount}</span>
          </div>
          <div className="stats-row">
            <span>{t('inTrash')}</span>
            <span>{notes.filter((n) => n.deleted).length}</span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>{t('close')}</button>
        </div>
      </div>
    </div>
  );
}

export default Stats;
