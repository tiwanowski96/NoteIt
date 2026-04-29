import React, { useState } from 'react';

interface Props {
  onComplete: () => void;
}

const slides = [
  {
    title: 'Witaj w NoteIt',
    description: 'Twoje notatki, zawsze pod ręką. Szybkie, piękne i lokalne.',
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
    title: 'Skróty klawiszowe',
    description: 'Ctrl+Q otwiera notatki z dowolnego miejsca. Ctrl+Shift+Q otwiera ostatnią. Ctrl+Shift+S robi screenshot.',
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
    title: 'Wklej screenshoty',
    description: 'Ctrl+V wkleja obraz ze schowka. Możesz też przeciągnąć plik. Formatuj tekst, dodawaj tagi, kolory i checklisty.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
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
            Pomiń
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
