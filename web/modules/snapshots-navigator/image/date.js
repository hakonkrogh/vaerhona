import React, { useState, createRef, useEffect } from 'react';

import { prettyDateTime, graphDate } from 'core/date';
import { timeAgo } from 'core/time-ago';

import styles from './date.module.css';

const deviceDoesDateChangeOnBlur = (() => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.navigator.userAgent.includes('iPhone');
})();

export default function DateCmp({ snapshot, place, onDateChange }) {
  const dateRef = createRef();
  const [enableDateChange, setEnableDateChange] = useState(true);
  const [date, setDate] = useState(snapshot.date);
  // The current time, or null until the browser has taken over. "Time ago"
  // depends on it, so the server and the browser can disagree on the text.
  // The line keeps its height until then.
  const [now, setNow] = useState(null);

  // Keeps the text up to date while the page stays open.
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 30 * 1000);
    return () => clearInterval(timer);
  }, []);

  function executeDateChange(dateValue) {
    const d = new Date(dateValue);
    d.setHours(new Date(snapshot.date).getHours());

    onDateChange?.(d);
  }

  function dateChange(e) {
    setDate(e.target.value);
    if (!deviceDoesDateChangeOnBlur) {
      executeDateChange(e.target.value);
    }
  }

  function dateBlur() {
    if (deviceDoesDateChangeOnBlur) {
      executeDateChange(date);
    }
  }

  useEffect(() => {
    if (dateRef.current) {
      if (dateRef.current.type !== 'date') {
        setEnableDateChange(false);
      }
    }
  }, [dateRef]);

  const minDate = place.firstSnapshot?.date;

  return (
    <div className={styles.outer}>
      <div className={styles.timeAgo}>
        {now !== null ? (
          <time dateTime={new Date(snapshot.date).toISOString()}>
            {timeAgo(snapshot.date, now)}
          </time>
        ) : (
          '\u00a0'
        )}
      </div>
      <div className={styles.dateString}>
        <span className={styles.inputPlacer}>
          {prettyDateTime(snapshot.date)}
          {enableDateChange && (
            <input
              type="date"
              className={styles.input}
              ref={dateRef}
              value={graphDate(date)}
              onChange={dateChange}
              onBlur={dateBlur}
              min={graphDate(minDate)}
              max={graphDate(new Date())}
            />
          )}
        </span>
      </div>
    </div>
  );
}
