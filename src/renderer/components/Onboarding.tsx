import React, { useState } from 'react';

interface Props {
  onComplete: () => void;
}

const slides = [
  {
    title: 'Witaj w NoteIt',
    description: 'Twoje notatki, zawsze pod reka. Szybkie, piekne i lokalne. Aplikacja dziala w tle jako ikona przy zegarku.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    title: 'Skroty globalne',
    description: 'Ctrl+Q otwiera notatki. Ctrl+Shift+Q ostatnia notatka. Ctrl+Shift+S screenshot. Ctrl+Shift+V schowek jako notatka. Dzialaja z kazdej aplikacji.',
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
    title: 'Edytor',
    description: 'Wklej screenshoty (Ctrl+V), przeciagnij obrazy, formatuj tekst. Wpisz / aby szybko wstawic tabele, checklisty, naglowki. Ctrl+F szukaj i zamieniaj.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    title: 'Funkcje',
    description: 'Przypomnienia, Pomodoro timer, szablony, tagi, kanban, szyfrowanie notatek PIN-em, sticky notes na pulpicie, eksport .md/.zip, podnotatki.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
];

function Onboarding({ onComplete }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);

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

        <div className="onboarding-dots">
          {slides.map((_, i) => (
            <span key={i} className={`onboarding-dot ${i === currentSlide ? 'active' : ''}`} />
          ))}
        </div>

        <div className="onboarding-actions">
          <button className="btn btn-secondary" onClick={handleSkip}>
            Pomin
          </button>
          <button className="btn btn-primary" onClick={handleNext}>
            {currentSlide < slides.length - 1 ? 'Dalej' : 'Zaczynamy'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
