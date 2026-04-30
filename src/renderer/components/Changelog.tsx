import React from 'react';
import { useLang } from '../LangContext';

interface Props {
  onClose: () => void;
}

function Changelog({ onClose }: Props) {
  const { lang } = useLang();

  const features102 = lang === 'en' ? [
    'Templates now match selected language',
    'Dynamic version display in Settings',
    'Improved installer file naming',
  ] : [
    'Szablony notatek w wybranym jezyku',
    'Dynamiczne wyswietlanie wersji w Ustawieniach',
    'Poprawione nazwy plikow instalatora',
  ];

  const features101 = lang === 'en' ? [
    'Fixed application icon in Start Menu and taskbar',
    'Improved icon embedding in installer',
  ] : [
    'Naprawiono ikone aplikacji w menu Start i na pasku zadan',
    'Poprawiono osadzanie ikony w instalatorze',
  ];

  const features = lang === 'en' ? [
    'Rich text editor with formatting, colors, highlights',
    'Screenshots (Ctrl+Shift+S/C)',
    'Pomodoro timer with mini mode',
    'Note encryption with PIN',
    'Kanban view',
    'Subnotes (hierarchical notes)',
    'Reminders with notifications',
    'Templates',
    'Tags and search',
    'Import/Export (.md, .zip)',
    'Sticky notes on desktop',
    'Slash commands (/)',
    'Table of Contents',
    'Auto-paste tables from Excel',
    'EN/PL language support',
    'System tray with global shortcuts',
    'Always on top mode',
  ] : [
    'Edytor tekstu z formatowaniem, kolorami, zakreslaczem',
    'Screenshoty (Ctrl+Shift+S/C)',
    'Timer Pomodoro z trybem mini',
    'Szyfrowanie notatek PIN-em',
    'Widok Kanban',
    'Podnotatki (hierarchia notatek)',
    'Przypomnienia z powiadomieniami',
    'Szablony',
    'Tagi i wyszukiwanie',
    'Import/Eksport (.md, .zip)',
    'Karteczki na pulpicie',
    'Slash commands (/)',
    'Spis tresci',
    'Auto-wklejanie tabel z Excela',
    'Obsluga EN/PL',
    'Zasobnik systemowy ze skrotami globalnymi',
    'Tryb zawsze na wierzchu',
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-changelog" onClick={(e) => e.stopPropagation()}>
        <div className="changelog-header">
          <h3>{lang === 'en' ? "What's new" : 'Co nowego'}</h3>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="changelog-content">
          <div className="changelog-version">
            <div className="changelog-version-header">
              <span className="changelog-badge">v1.0.2</span>
              <span className="changelog-date">2026</span>
            </div>
            <ul className="changelog-list">
              {features102.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>
          <div className="changelog-version">
            <div className="changelog-version-header">
              <span className="changelog-badge">v1.0.1</span>
              <span className="changelog-date">2026</span>
            </div>
            <ul className="changelog-list">
              {features101.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>
          <div className="changelog-version">
            <div className="changelog-version-header">
              <span className="changelog-badge">v1.0.0</span>
              <span className="changelog-date">2026</span>
            </div>
            <ul className="changelog-list">
              {features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Changelog;
