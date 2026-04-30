import React, { useState } from 'react';
import { useLang } from '../LangContext';

interface Props {
  onComplete: () => void;
  lang: 'en' | 'pl';
  onLangChange: (lang: 'en' | 'pl') => void;
  theme: 'light' | 'dark';
  onThemeChange: () => void;
  autoStart: boolean;
  onAutoStartChange: (value: boolean) => void;
  showOnStart: boolean;
  onShowOnStartChange: (value: boolean) => void;
}

function Onboarding({ onComplete, lang, onLangChange, theme, onThemeChange, autoStart, onAutoStartChange, showOnStart, onShowOnStartChange }: Props) {
  const { t } = useLang();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: t('welcomeTitle'),
      description: t('welcomeDesc'),
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
      custom: (
        <div className="onboarding-preferences">
          <div className="onboarding-pref-row">
            <span>{t('language')}</span>
            <div className="lang-toggle">
              <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => onLangChange('en')}>EN</button>
              <button className={`lang-btn ${lang === 'pl' ? 'active' : ''}`} onClick={() => onLangChange('pl')}>PL</button>
            </div>
          </div>
          <div className="onboarding-pref-row">
            <span>{t('appearance')}</span>
            <div className="lang-toggle">
              <button className={`lang-btn ${theme === 'light' ? 'active' : ''}`} onClick={theme === 'dark' ? onThemeChange : undefined}>Light</button>
              <button className={`lang-btn ${theme === 'dark' ? 'active' : ''}`} onClick={theme === 'light' ? onThemeChange : undefined}>Dark</button>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: lang === 'en' ? 'System' : 'System',
      description: lang === 'en' ? 'Configure how NoteIt behaves on your system.' : 'Skonfiguruj jak NoteIt zachowuje sie w systemie.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68 1.65 1.65 0 0 0 9 3V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      ),
      custom: (
        <div className="onboarding-preferences">
          <div className="onboarding-pref-row">
            <div className="settings-row-label">
              <span>{lang === 'en' ? 'Start with Windows' : 'Uruchom z Windows'}</span>
              <span className="settings-row-hint">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <span className="settings-tooltip">
                  {lang === 'en' ? 'NoteIt will automatically start when you log in to Windows and run in the system tray' : 'NoteIt uruchomi sie automatycznie po zalogowaniu do Windows i bedzie dzialac w zasobniku systemowym'}
                </span>
              </span>
            </div>
            <button
              className={`toggle-switch ${autoStart ? 'active' : ''}`}
              onClick={() => onAutoStartChange(!autoStart)}
            >
              <span className="toggle-knob" />
            </button>
          </div>
          <div className="onboarding-pref-row">
            <div className="settings-row-label">
              <span>{lang === 'en' ? 'Show window on start' : 'Pokaz okno przy starcie'}</span>
              <span className="settings-row-hint">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <span className="settings-tooltip">
                  {lang === 'en' ? 'When enabled, the main notes window will open automatically after NoteIt starts' : 'Gdy wlaczone, glowne okno notatek otworzy sie automatycznie po uruchomieniu NoteIt'}
                </span>
              </span>
            </div>
            <button
              className={`toggle-switch ${showOnStart ? 'active' : ''}`}
              onClick={() => onShowOnStartChange(!showOnStart)}
            >
              <span className="toggle-knob" />
            </button>
          </div>
        </div>
      ),
    },
    {
      title: t('aboutTitle'),
      description: t('aboutDesc'),
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      ),
    },
    {
      title: t('shortcutsTitle'),
      description: t('shortcutsDesc'),
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <line x1="6" y1="8" x2="6.01" y2="8" />
          <line x1="10" y1="8" x2="10.01" y2="8" />
          <line x1="14" y1="8" x2="14.01" y2="8" />
          <line x1="18" y1="8" x2="18.01" y2="8" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="6" y1="16" x2="6.01" y2="16" />
          <line x1="18" y1="16" x2="18.01" y2="16" />
        </svg>
      ),
    },
    {
      title: t('editorTitle'),
      description: t('editorDesc'),
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
    },
    {
      title: t('featuresTitle'),
      description: t('featuresDesc'),
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const slide = slides[currentSlide];
  const isFirst = currentSlide === 0;
  const isLast = currentSlide === slides.length - 1;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="onboarding-icon">{slide.icon}</div>
        <h2 className="onboarding-title">{slide.title}</h2>
        <p className="onboarding-description">{slide.description}</p>
        {'custom' in slide && slide.custom}

        <div className="onboarding-dots">
          {slides.map((_, i) => (
            <span key={i} className={`onboarding-dot ${i === currentSlide ? 'active' : ''}`} />
          ))}
        </div>

        <div className="onboarding-actions">
          {isFirst ? (
            <button className="btn btn-secondary" onClick={handleSkip}>
              {t('skip')}
            </button>
          ) : (
            <div className="onboarding-actions-left">
              <button className="btn btn-secondary" onClick={handlePrev}>
                {t('back')}
              </button>
              <button className="btn btn-secondary" onClick={handleSkip}>
                {t('skip')}
              </button>
            </div>
          )}
          {isLast ? (
            <button className="btn btn-primary" onClick={onComplete}>
              {t('start')}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleNext}>
              {t('next')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
