import React from 'react';

interface Props {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onClose: () => void;
}

function Settings({ fontSize, onFontSizeChange, onClose }: Props) {
  const offset = fontSize - 15; // -3 to +3 from base 15

  const labels = ['Mały', 'Mniejszy', 'Mały+', 'Normalny', 'Duży-', 'Większy', 'Duży'];
  const currentLabel = labels[offset + 3] || 'Normalny';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-settings" onClick={(e) => e.stopPropagation()}>
        <h3>Ustawienia</h3>

        <div className="settings-section">
          <h4>Wygląd</h4>
          <div className="settings-row">
            <span>Rozmiar tekstu w aplikacji</span>
            <div className="font-size-control">
              <button
                className="btn-icon"
                onClick={() => onFontSizeChange(Math.max(12, fontSize - 1))}
                disabled={fontSize <= 12}
                aria-label="Zmniejsz"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <span className="font-size-value">{offset > 0 ? `+${offset}` : offset}</span>
              <button
                className="btn-icon"
                onClick={() => onFontSizeChange(Math.min(18, fontSize + 1))}
                disabled={fontSize >= 18}
                aria-label="Zwiększ"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
          </div>
          <div className="font-size-preview">
            <span className="font-size-label">{currentLabel}</span>
            <span className="font-size-sample" style={{ fontSize: `${fontSize}px` }}>Przykładowy tekst notatki</span>
          </div>
        </div>

        <div className="settings-section">
          <h4>Konto</h4>
          <div className="settings-coming-soon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <div>
              <p className="coming-soon-title">Logowanie i synchronizacja</p>
              <p className="coming-soon-desc">Email, Google OAuth – w przygotowaniu</p>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h4>Informacje</h4>
          <div className="settings-row">
            <span>Wersja</span>
            <span className="settings-value">1.0.0</span>
          </div>
          <div className="settings-row">
            <span>Dane przechowywane</span>
            <span className="settings-value">Lokalnie</span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>Zamknij</button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
