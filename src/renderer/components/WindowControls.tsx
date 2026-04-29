import React from 'react';

function WindowControls() {
  const handleMinimize = () => {
    window.electronAPI.windowAction('minimize');
  };

  const handleMaximize = () => {
    window.electronAPI.windowAction('maximize');
  };

  const handleClose = () => {
    window.electronAPI.windowAction('close');
  };

  return (
    <div className="window-controls">
      <button className="window-btn window-btn-minimize" onClick={handleMinimize} aria-label="Minimalizuj">
        <svg width="10" height="10" viewBox="0 0 12 12">
          <rect x="1" y="5.5" width="10" height="1" fill="currentColor"/>
        </svg>
      </button>
      <button className="window-btn window-btn-maximize" onClick={handleMaximize} aria-label="Maksymalizuj">
        <svg width="10" height="10" viewBox="0 0 12 12">
          <rect x="1.5" y="1.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1.2"/>
        </svg>
      </button>
      <button className="window-btn window-btn-close" onClick={handleClose} aria-label="Zamknij">
        <svg width="10" height="10" viewBox="0 0 12 12">
          <line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" strokeWidth="1.3"/>
          <line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" strokeWidth="1.3"/>
        </svg>
      </button>
    </div>
  );
}

export default WindowControls;
