import React from 'react';
import { useLang } from '../LangContext';

interface Props {
  mode: 'work' | 'break';
  timeLeft: number;
  isRunning: boolean;
  sessions: number;
  workMinutes: number;
  breakMinutes: number;
  onToggleRunning: () => void;
  onReset: () => void;
  onSkip: () => void;
  onSetMode: (mode: 'work' | 'break') => void;
  onSetWorkMinutes: (min: number) => void;
  onSetBreakMinutes: (min: number) => void;
  onClose: () => void;
  onMiniMode: () => void;
}

function PomodoroTimer({
  mode, timeLeft, isRunning, sessions, workMinutes, breakMinutes,
  onToggleRunning, onReset, onSkip, onSetMode, onSetWorkMinutes, onSetBreakMinutes,
  onClose, onMiniMode
}: Props) {
  const { t } = useLang();

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  const totalSeconds = mode === 'work' ? workMinutes * 60 : breakMinutes * 60;
  const progress = 1 - timeLeft / totalSeconds;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-pomodoro" onClick={(e) => e.stopPropagation()}>
        <div className="pomodoro-header">
          <h3>{t('pomodoro')}</h3>
          <span className="pomodoro-sessions">{sessions} {t('sessions')}</span>
        </div>

        <div className="pomodoro-mode-toggle">
          <button
            className={`pomodoro-mode-btn ${mode === 'work' ? 'active' : ''}`}
            onClick={() => onSetMode('work')}
          >
            {t('work')}
          </button>
          <button
            className={`pomodoro-mode-btn ${mode === 'break' ? 'active' : ''}`}
            onClick={() => onSetMode('break')}
          >
            {t('break')}
          </button>
        </div>

        <div className="pomodoro-timer">
          <svg className="pomodoro-ring" width="140" height="140" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="6" />
            <circle
              cx="60" cy="60" r="54" fill="none"
              stroke={mode === 'work' ? 'var(--accent)' : '#10b981'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <span className="pomodoro-time">{formatTime(timeLeft)}</span>
        </div>

        <div className="pomodoro-controls">
          <button className="btn btn-secondary btn-sm" onClick={onReset}>{t('reset')}</button>
          <button className="btn btn-primary" onClick={onToggleRunning}>
            {isRunning ? t('pause') : t('start')}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onSkip}>{t('skip')}</button>
          <button className="btn btn-secondary btn-sm" onClick={onMiniMode} title={t('miniMode')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
            </svg>
          </button>
        </div>

        <div className="pomodoro-settings">
          <div className="pomodoro-setting">
            <span>{t('work')}</span>
            <div className="pomodoro-setting-control">
              <button className="btn-icon" onClick={() => onSetWorkMinutes(Math.max(5, workMinutes - 5))}>-</button>
              <span>{workMinutes} min</span>
              <button className="btn-icon" onClick={() => onSetWorkMinutes(Math.min(60, workMinutes + 5))}>+</button>
            </div>
          </div>
          <div className="pomodoro-setting">
            <span>{t('break')}</span>
            <div className="pomodoro-setting-control">
              <button className="btn-icon" onClick={() => onSetBreakMinutes(Math.max(1, breakMinutes - 1))}>-</button>
              <span>{breakMinutes} min</span>
              <button className="btn-icon" onClick={() => onSetBreakMinutes(Math.min(30, breakMinutes + 1))}>+</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PomodoroTimer;
