import React, { useState, useEffect, useRef } from 'react';

interface Props {
  value: string; // ISO string or empty
  onChange: (isoString: string) => void;
  onClear: () => void;
}

const MONTHS_PL = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
];

const DAYS_PL = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

function DateTimePicker({ value, onChange, onClear }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [use24h, setUse24h] = useState(true);
  const [viewDate, setViewDate] = useState(() => {
    return value ? new Date(value) : new Date();
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : new Date());
  const [hour, setHour] = useState(() => {
    return value ? new Date(value).getHours() : new Date().getHours();
  });
  const [minute, setMinute] = useState(() => {
    return value ? new Date(value).getMinutes() : new Date().getMinutes();
  });
  const [ampm, setAmpm] = useState<'AM' | 'PM'>(() => {
    const h = value ? new Date(value).getHours() : new Date().getHours();
    return h >= 12 ? 'PM' : 'AM';
  });

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      // Use timeout to avoid closing immediately on the same click that opens
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClick);
      }, 0);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClick);
      };
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  useEffect(() => {
    const saved = localStorage.getItem('noteit-24h');
    if (saved !== null) setUse24h(saved === 'true');
  }, []);

  function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(year: number, month: number): number {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  }

  function handleDayClick(day: number) {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setSelectedDate(newDate);
  }

  function handleConfirm() {
    const date = selectedDate || new Date();
    let h = hour;
    if (!use24h) {
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
    }
    const result = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      h,
      minute
    );
    onChange(result.toISOString());
    setIsOpen(false);
  }

  function handlePrevMonth() {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  }

  function handleNextMonth() {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  }

  function toggle24h() {
    const newVal = !use24h;
    setUse24h(newVal);
    localStorage.setItem('noteit-24h', String(newVal));
    if (newVal) {
      // Switching to 24h
      let h = hour;
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      setHour(h);
    } else {
      // Switching to 12h
      setAmpm(hour >= 12 ? 'PM' : 'AM');
      setHour(hour % 12 || 12);
    }
  }

  function incrementHour() {
    if (use24h) {
      setHour((h) => (h + 1) % 24);
    } else {
      setHour((h) => {
        const next = h + 1;
        return next > 12 ? 1 : next;
      });
    }
  }

  function decrementHour() {
    if (use24h) {
      setHour((h) => (h - 1 + 24) % 24);
    } else {
      setHour((h) => {
        const next = h - 1;
        return next < 1 ? 12 : next;
      });
    }
  }

  function incrementMinute() {
    setMinute((m) => (m + 1) % 60);
  }

  function decrementMinute() {
    setMinute((m) => (m - 1 + 60) % 60);
  }

  function handleHourInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, '');
    if (val === '') { setHour(0); return; }
    const num = parseInt(val, 10);
    const max = use24h ? 23 : 12;
    const min = use24h ? 0 : 1;
    if (num >= min && num <= max) {
      setHour(num);
    } else if (num > max) {
      setHour(max);
    }
  }

  function handleMinuteInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, '');
    if (val === '') { setMinute(0); return; }
    const num = parseInt(val, 10);
    if (num >= 0 && num <= 59) {
      setMinute(num);
    } else if (num > 59) {
      setMinute(59);
    }
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();

  return (
    <div className="dtp-wrapper" ref={ref}>
      <button
        className={`btn-icon ${value ? 'reminder-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={value ? `Przypomnienie: ${new Date(value).toLocaleString('pl-PL')}` : 'Ustaw przypomnienie'}
        aria-label="Przypomnienie"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </button>

      {value && (
        <span className="reminder-badge">
          {new Date(value).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
          <button className="reminder-clear" onClick={onClear} aria-label="Usuń przypomnienie">&times;</button>
        </span>
      )}

      {isOpen && (
        <div className="dtp-dropdown" onMouseDown={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="dtp-header">
            <button className="dtp-nav" onClick={handlePrevMonth} aria-label="Poprzedni miesiąc">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="dtp-month-year">{MONTHS_PL[month]} {year}</span>
            <button className="dtp-nav" onClick={handleNextMonth} aria-label="Następny miesiąc">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {/* Days of week */}
          <div className="dtp-days-header">
            {DAYS_PL.map((d) => (
              <span key={d} className="dtp-day-label">{d}</span>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="dtp-days-grid">
            {Array.from({ length: firstDay }).map((_, i) => (
              <span key={`empty-${i}`} className="dtp-day empty" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = selectedDate && day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
              const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
              return (
                <button
                  key={day}
                  className={`dtp-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''}`}
                  onClick={() => handleDayClick(day)}
                  disabled={isPast}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Time picker */}
          <div className="dtp-time">
            <div className="dtp-time-col">
              <button className="dtp-time-btn" onClick={incrementHour} aria-label="Godzina +">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"/></svg>
              </button>
              <input
                type="text"
                className="dtp-time-input"
                value={String(hour).padStart(2, '0')}
                onChange={handleHourInput}
                maxLength={2}
                aria-label="Godzina"
              />
              <button className="dtp-time-btn" onClick={decrementHour} aria-label="Godzina -">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>
            <span className="dtp-time-sep">:</span>
            <div className="dtp-time-col">
              <button className="dtp-time-btn" onClick={incrementMinute} aria-label="Minuta +">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"/></svg>
              </button>
              <input
                type="text"
                className="dtp-time-input"
                value={String(minute).padStart(2, '0')}
                onChange={handleMinuteInput}
                maxLength={2}
                aria-label="Minuta"
              />
              <button className="dtp-time-btn" onClick={decrementMinute} aria-label="Minuta -">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>
            {!use24h && (
              <button className="dtp-ampm" onClick={() => setAmpm(ampm === 'AM' ? 'PM' : 'AM')}>
                {ampm}
              </button>
            )}
            <button className="dtp-format-toggle" onClick={toggle24h} title={use24h ? 'Przełącz na 12h' : 'Przełącz na 24h'}>
              {use24h ? '12h' : '24h'}
            </button>
          </div>

          {/* Actions */}
          <div className="dtp-actions">
            {value && (
              <button className="btn btn-secondary btn-sm" onClick={() => { onClear(); setIsOpen(false); }}>
                Usuń
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={handleConfirm}>
              Ustaw
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DateTimePicker;
