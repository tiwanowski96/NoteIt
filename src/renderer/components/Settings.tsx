import React from 'react';
import { Lang } from '../i18n';
import { useLang } from '../LangContext';

interface Props {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onClose: () => void;
}

function Settings({ fontSize, onFontSizeChange, lang, onLangChange, onClose }: Props) {
  const { t } = useLang();
  const appOffset = fontSize - 15;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-settings" onClick={(e) => e.stopPropagation()}>
        <h3>{t('settings')}</h3>

        <div className="settings-section">
          <h4>{t('appearance')}</h4>

          <div className="settings-row">
            <span>{t('fontSize')}</span>
            <div className="font-size-control">
              <button className="btn-icon" onClick={() => onFontSizeChange(Math.max(12, fontSize - 1))} disabled={fontSize <= 12}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <span className="font-size-value">{appOffset > 0 ? `+${appOffset}` : appOffset}</span>
              <button className="btn-icon" onClick={() => onFontSizeChange(Math.min(18, fontSize + 1))} disabled={fontSize >= 18}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
          </div>

          <div className="settings-row">
            <span>{t('language')}</span>
            <div className="lang-toggle">
              <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => onLangChange('en')}>EN</button>
              <button className={`lang-btn ${lang === 'pl' ? 'active' : ''}`} onClick={() => onLangChange('pl')}>PL</button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h4>{t('account')}</h4>
          <div className="settings-coming-soon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <div>
              <p className="coming-soon-title">{t('loginSync')}</p>
              <p className="coming-soon-desc">{t('comingSoon')}</p>
            </div>
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
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>{t('close')}</button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
