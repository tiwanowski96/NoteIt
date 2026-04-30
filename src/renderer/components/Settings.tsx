import React, { useState } from 'react';
import { Lang } from '../i18n';
import { useLang } from '../LangContext';

interface Props {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  autoStart: boolean;
  onAutoStartChange: (value: boolean) => void;
  onClose: () => void;
}

function Settings({ fontSize, onFontSizeChange, lang, onLangChange, autoStart, onAutoStartChange, onClose }: Props) {
  const { t } = useLang();
  const appOffset = fontSize - 15;
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showLicenses, setShowLicenses] = useState(false);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-settings" onClick={(e) => e.stopPropagation()}>
        <h3>{t('settings')}</h3>

        <div className="settings-section">
          <h4>{t('appearance')}</h4>

          <div className="settings-row">
            <span>{t('fontSize')}</span>
            <div className="font-size-control">
              <button className="btn-icon" onClick={() => onFontSizeChange(Math.max(13, fontSize - 1))} disabled={fontSize <= 13}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <span className="font-size-value">{appOffset > 0 ? `+${appOffset}` : appOffset}</span>
              <button className="btn-icon" onClick={() => onFontSizeChange(Math.min(17, fontSize + 1))} disabled={fontSize >= 17}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h4>{lang === 'en' ? 'System' : 'System'}</h4>

          <div className="settings-row">
            <span>{t('language')}</span>
            <div className="lang-toggle">
              <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => onLangChange('en')}>EN</button>
              <button className={`lang-btn ${lang === 'pl' ? 'active' : ''}`} onClick={() => onLangChange('pl')}>PL</button>
            </div>
          </div>

          <div className="settings-row">
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
              aria-label="Autostart"
            >
              <span className="toggle-knob" />
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h4>{t('info')}</h4>
          <div className="settings-row">
            <span>{t('version')}</span>
            <span className="settings-value">1.0.0</span>
          </div>
          <div className="settings-row">
            <span>{t('dataStored')}</span>
            <span className="settings-value">{t('locally')}</span>
          </div>
          <div className="settings-row">
            <span>© 2026 The Cloudest - Tomasz Iwanowski</span>
          </div>
          <div className="settings-links">
            <button className="settings-link-btn" onClick={() => setShowPrivacy(true)}>
              {lang === 'en' ? 'Privacy Policy' : 'Polityka prywatnosci'}
            </button>
            <button className="settings-link-btn" onClick={() => setShowLicenses(true)}>
              {lang === 'en' ? 'Licenses' : 'Licencje'}
            </button>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>{t('close')}</button>
        </div>
      </div>

      {showPrivacy && (
        <div className="modal-overlay" onClick={(e) => { e.stopPropagation(); setShowPrivacy(false); }} style={{ zIndex: 2001 }}>
          <div className="modal modal-legal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-legal-header">
              <h3>{lang === 'en' ? 'Privacy Policy' : 'Polityka prywatnosci'}</h3>
              <button className="btn-icon" onClick={() => setShowPrivacy(false)} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-legal-content">
              {lang === 'en' ? (
                <>
                  <p><strong>NoteIt</strong> is a local desktop application. Your privacy is fully protected.</p>
                  <h4>Data collection</h4>
                  <p>NoteIt does not collect, transmit, or share any personal data. All notes, settings, and files are stored exclusively on your local device.</p>
                  <h4>Network access</h4>
                  <p>The application does not connect to the internet. No data is sent to external servers.</p>
                  <h4>Third parties</h4>
                  <p>No third-party analytics, tracking, or advertising services are used.</p>
                  <h4>Data storage</h4>
                  <p>All data is stored locally using electron-store in your user profile directory. You have full control over your data and can delete it at any time.</p>
                  <h4>Contact</h4>
                  <p>The Cloudest - Tomasz Iwanowski<br/>noteit@tomasziwanowski.com</p>
                </>
              ) : (
                <>
                  <p><strong>NoteIt</strong> to lokalna aplikacja desktopowa. Twoja prywatnosc jest w pelni chroniona.</p>
                  <h4>Zbieranie danych</h4>
                  <p>NoteIt nie zbiera, nie przesyla ani nie udostepnia zadnych danych osobowych. Wszystkie notatki, ustawienia i pliki sa przechowywane wylacznie na Twoim urzadzeniu.</p>
                  <h4>Dostep do sieci</h4>
                  <p>Aplikacja nie laczy sie z internetem. Zadne dane nie sa wysylane na zewnetrzne serwery.</p>
                  <h4>Podmioty trzecie</h4>
                  <p>Nie sa uzywane zadne uslugi analityczne, sledzace ani reklamowe.</p>
                  <h4>Przechowywanie danych</h4>
                  <p>Wszystkie dane sa przechowywane lokalnie za pomoca electron-store w katalogu profilu uzytkownika. Masz pelna kontrole nad swoimi danymi i mozesz je usunac w dowolnym momencie.</p>
                  <h4>Kontakt</h4>
                  <p>The Cloudest - Tomasz Iwanowski<br/>noteit@tomasziwanowski.com</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showLicenses && (
        <div className="modal-overlay" onClick={(e) => { e.stopPropagation(); setShowLicenses(false); }} style={{ zIndex: 2001 }}>
          <div className="modal modal-legal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-legal-header">
              <h3>{lang === 'en' ? 'Licenses' : 'Licencje'}</h3>
              <button className="btn-icon" onClick={() => setShowLicenses(false)} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-legal-content">
              <p><strong>NoteIt</strong> © 2026 The Cloudest - Tomasz Iwanowski</p>
              <p>{lang === 'en' ? 'Licensed under the MIT License.' : 'Licencja MIT.'}</p>
              <h4>{lang === 'en' ? 'Open source libraries' : 'Biblioteki open source'}</h4>
              <div className="license-grid">
                <div className="license-item"><strong>Electron</strong><span>MIT</span></div>
                <div className="license-item"><strong>React</strong><span>MIT</span></div>
                <div className="license-item"><strong>Tiptap</strong><span>MIT</span></div>
                <div className="license-item"><strong>Vite</strong><span>MIT</span></div>
                <div className="license-item"><strong>TypeScript</strong><span>Apache 2.0</span></div>
                <div className="license-item"><strong>electron-store</strong><span>MIT</span></div>
                <div className="license-item"><strong>ProseMirror</strong><span>MIT</span></div>
                <div className="license-item"><strong>Inter Font</strong><span>OFL 1.1</span></div>
              </div>
              <p className="license-footer">
                {lang === 'en'
                  ? 'Full license texts are available in the respective package repositories.'
                  : 'Pelne teksty licencji dostepne sa w repozytoriach poszczegolnych pakietow.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
