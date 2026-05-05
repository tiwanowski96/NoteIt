import React from 'react';
import { useLang } from '../LangContext';

interface Props {
  onClose: () => void;
}

function Changelog({ onClose }: Props) {
  const { lang } = useLang();

  const features110 = lang === 'en' ? [
    'Password Vault with AES-256 encryption',
    'Password strength indicator',
    'Old password warning (90+ days)',
    'File associations for .txt and .md',
    'Full-text search with content preview',
    'Dark mode moved to Settings',
    'Custom vault categories + Archive',
    'Import/export CSV (KeePass compatible)',
    'Vault in separate window or modal',
    'Polish diacritics in all translations',
  ] : [
    'Sejf haseł z szyfrowaniem AES-256',
    'Wskaźnik siły hasła',
    'Ostrzeżenie o starych hasłach (90+ dni)',
    'Skojarzenia plików .txt i .md',
    'Wyszukiwanie pełnotekstowe z podglądem',
    'Ciemny motyw przeniesiony do Ustawień',
    'Własne kategorie sejfu + Archiwum',
    'Import/eksport CSV (kompatybilny z KeePass)',
    'Sejf w osobnym oknie lub modalu',
    'Polskie znaki diakrytyczne we wszystkich tłumaczeniach',
  ];

  const features106 = lang === 'en' ? [
    'Gradient background in light and dark mode',
    'Note card hover bar rounds with card corners',
    'Settings links as icon buttons with tooltips',
  ] : [
    'Gradientowe tlo w jasnym i ciemnym trybie',
    'Pasek hover notatki zaokragla sie z rogami karty',
    'Linki w Ustawieniach jako ikony z podpisami',
  ];

  const features105 = lang === 'en' ? [
    'Search bar opens full-text search modal',
    'Unified search experience (search bar = Ctrl+P)',
  ] : [
    'Pasek wyszukiwania otwiera modal pelnotekstowego wyszukiwania',
    'Ujednolicone wyszukiwanie (pasek = Ctrl+P)',
  ];

  const features104 = lang === 'en' ? [
    'Open .txt and .md files directly in NoteIt',
    'Global search now searches inside note content',
    'Search results show content preview with highlights',
    'Install to Program Files',
  ] : [
    'Otwieranie plikow .txt i .md bezposrednio w NoteIt',
    'Wyszukiwanie globalne przeszukuje tresc notatek',
    'Wyniki wyszukiwania z podgladem tresci i podswietleniem',
    'Instalacja do Program Files',
  ];

  const features102 = lang === 'en' ? [
    'Templates now match selected language',
    'Dynamic version display in Settings',
    'Custom tile icons for Microsoft Store',
    'Improved installer file naming',
  ] : [
    'Szablony notatek w wybranym jezyku',
    'Dynamiczne wyswietlanie wersji w Ustawieniach',
    'Wlasne ikony kafelkow dla Microsoft Store',
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
              <span className="changelog-badge">v1.1.0</span>
              <span className="changelog-date">2026</span>
            </div>
            <ul className="changelog-list">
              {features110.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>
          <div className="changelog-version">
            <div className="changelog-version-header">
              <span className="changelog-badge">v1.0.6</span>
              <span className="changelog-date">2026</span>
            </div>
            <ul className="changelog-list">
              {features106.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>
          <div className="changelog-version">
            <div className="changelog-version-header">
              <span className="changelog-badge">v1.0.5</span>
              <span className="changelog-date">2026</span>
            </div>
            <ul className="changelog-list">
              {features105.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>
          <div className="changelog-version">
            <div className="changelog-version-header">
              <span className="changelog-badge">v1.0.4</span>
              <span className="changelog-date">2026</span>
            </div>
            <ul className="changelog-list">
              {features104.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>
          <div className="changelog-version">
            <div className="changelog-version-header">
              <span className="changelog-badge">v1.0.3</span>
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
