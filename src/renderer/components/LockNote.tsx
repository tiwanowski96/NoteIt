import React, { useState } from 'react';

interface LockModalProps {
  onLock: (pin: string) => void;
  onClose: () => void;
}

export function LockModal({ onLock, onClose }: LockModalProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (pin.length < 4) {
      setError('PIN musi miec minimum 4 znaki');
      return;
    }
    if (pin !== confirmPin) {
      setError('PIN-y nie sa identyczne');
      return;
    }
    onLock(pin);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Zaszyfruj notatke</h3>
        <p style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Ustaw PIN aby zabezpieczyc notatke. Bez PIN-u nie bedzie mozna jej otworzyc.
        </p>
        <input
          type="password"
          className="find-input"
          placeholder="PIN (min. 4 znaki)"
          value={pin}
          onChange={(e) => { setPin(e.target.value); setError(''); }}
          style={{ marginBottom: 8 }}
          autoFocus
        />
        <input
          type="password"
          className="find-input"
          placeholder="Potwierdz PIN"
          value={confirmPin}
          onChange={(e) => { setConfirmPin(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          style={{ marginBottom: 8 }}
        />
        {error && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginBottom: 8 }}>{error}</p>}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Anuluj</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Zaszyfruj</button>
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
  const [pin, setPin] = useState('');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-unlock" onClick={(e) => e.stopPropagation()}>
        <div className="unlock-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h3>Notatka zaszyfrowana</h3>
        <p className="unlock-desc">Wprowadz PIN aby odczytac notatke</p>
        <input
          type="password"
          className="unlock-input"
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && pin && onUnlock(pin)}
          autoFocus
        />
        {error && <p className="unlock-error">Nieprawidlowy PIN</p>}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Anuluj</button>
          <button className="btn btn-primary" onClick={() => onUnlock(pin)} disabled={!pin}>Odblokuj</button>
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
  const [pin, setPin] = useState('');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-unlock" onClick={(e) => e.stopPropagation()}>
        <div className="unlock-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 5-5 5 5 0 0 1 5 5"/>
          </svg>
        </div>
        <h3>Usun szyfrowanie</h3>
        <p className="unlock-desc">Wprowadz PIN aby usunac blokade</p>
        <input
          type="password"
          className="unlock-input"
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && pin && onRemove(pin)}
          autoFocus
        />
        {error && <p className="unlock-error">Nieprawidlowy PIN</p>}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Anuluj</button>
          <button className="btn btn-danger" onClick={() => onRemove(pin)} disabled={!pin}>Usun blokade</button>
        </div>
      </div>
    </div>
  );
}
