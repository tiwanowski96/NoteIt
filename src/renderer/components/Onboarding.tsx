import React, { useState } from 'react';
import { useLang } from '../LangContext';

interface Props {
  onComplete: () => void;
  lang: 'en' | 'pl';
  onLangChange: (lang: 'en' | 'pl') => void;
  theme: 'light' | 'dark';
  onThemeChange: () => void;
}

function Onboarding({ onComplete, lang, onLangChange, theme, onThemeChange }: Props) {
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
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const slide = slides[currentSlide];

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
          <button className="btn btn-secondary" onClick={handleSkip}>
            {t('skip')}
          </button>
          <button className="btn btn-primary" onClick={handleNext}>
            {currentSlide < slides.length - 1 ? t('next') : t('start')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
