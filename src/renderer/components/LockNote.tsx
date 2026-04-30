import React, { useState } from 'react';
import { useLang } from '../LangContext';

interface LockModalProps {
  onLock: (pin: string) => void;
  onClose: () => void;
}

export function LockModal({ onLock, onClose }: LockModalProps) {
  const { t } = useLang();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (pin.length < 4) {
      setError(t('pinMin'));
      return;
    }
    if (pin !== confirmPin) {
      setError(t('pinMismatch'));
      return;
    }
    onLock(pin);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{t('encryptNote')}</h3>
        <p style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          {t('setPinDesc')}
        </p>
        <input
          type="password"
          className="find-input"
          placeholder={t('pinPlaceholder')}
          value={pin}
          onChange={(e) => { setPin(e.target.value); setError(''); }}
          style={{ marginBottom: 8 }}
          autoFocus
        />
        <input
          type="password"
          className="find-input"
          placeholder={t('confirmPin')}
          value={confirmPin}
          onChange={(e) => { setConfirmPin(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          style={{ marginBottom: 8 }}
        />
        {error && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginBottom: 8 }}>{error}</p>}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{t('encrypt')}</button>
        </div>
      </div>
    </div>
  );
}

interface UnlockModalProps {
  onUnlock: (pin: string) => void;
  onClose: () => void;
  error?: boolean;
}

export function UnlockModal({ onUnlock, onClose, error }: UnlockModalProps) {
  const { t } = useLang();
  const [pin, setPin] = useState('');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-unlock" onClick={(e) => e.stopPropagation()}>
        <div className="unlock-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h3>{t('noteEncrypted')}</h3>
        <p className="unlock-desc">{t('enterPin')}</p>
        <input
          type="password"
          className="unlock-input"
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && pin && onUnlock(pin)}
          autoFocus
        />
        {error && <p className="unlock-error">{t('wrongPin')}</p>}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
          <button className="btn btn-primary" onClick={() => onUnlock(pin)} disabled={!pin}>{t('unlock')}</button>
        </div>
      </div>
    </div>
  );
}


interface RemoveLockModalProps {
  onRemove: (pin: string) => void;
  onClose: () => void;
  error?: boolean;
}

export function RemoveLockModal({ onRemove, onClose, error }: RemoveLockModalProps) {
  const { t } = useLang();
  const [pin, setPin] = useState('');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-unlock" onClick={(e) => e.stopPropagation()}>
        <div className="unlock-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 5-5 5 5 0 0 1 5 5"/>
          </svg>
        </div>
        <h3>{t('removeEncryption')}</h3>
        <p className="unlock-desc">{t('enterPinToRemove')}</p>
        <input
          type="password"
          className="unlock-input"
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && pin && onRemove(pin)}
          autoFocus
        />
        {error && <p className="unlock-error">{t('wrongPin')}</p>}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
          <button className="btn btn-danger" onClick={() => onRemove(pin)} disabled={!pin}>{t('removeLock')}</button>
        </div>
      </div>
    </div>
  );
}
