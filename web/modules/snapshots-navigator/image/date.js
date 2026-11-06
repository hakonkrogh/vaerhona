import React, { useState, createRef, useEffect } from 'react';
import TimeAgo from 'react-timeago';
import styled from 'styled-components';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import TaNo from 'react-timeago/lib/language-strings/no';

import { prettyDateTime, graphDate } from 'core/date';

const deviceDoesDateChangeOnBlur = (() => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.navigator.userAgent.includes('iPhone');
})();

// Set up the time ago component
let timeAgoFormatter = buildFormatter(TaNo);

const Outer = styled.div`
  position: relative;
  margin: 10px 0 25px 0;
`;

const DateTimeAgo = styled.div`
  font-size: 1.5em;
  text-align: center;
  margin-bottom: 3px;

  &::first-letter {
    text-transform: uppercase;
  }
`;

const DateString = styled.div`
  display: block;
  color: #888;
  text-align: center;
  position: relative;
`;

const DateInputPlacer = styled.span`
  position: relative;
  display: inline-block;
`;

const DateInput = styled.input.attrs(() => ({
  type: 'date',
}))`
  appearance: none;
  font-size: 1rem;
  position: absolute;
  top: calc(0px - 1em);
  left: calc(0px - 1em);
  width: calc(100% + 2em);
  height: calc(100% + 2em);
  z-index: 1;
  opacity: 0;
  border: none;
  cursor: pointer;

  &::-webkit-calendar-picker-indicator {
    width: 100%;
    height: 100%;
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &::-webkit-clear-button {
    display: none;
  }

  &::-ms-clear {
    width: 0;
    height: 0;
  }
`;

export default function DateCmp({ snapshot, place, onDateChange }) {
  const dateRef = createRef();
  const [enableDateChange, setEnableDateChange] = useState(true);
  const [date, setDate] = useState(snapshot.date);

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

  const minDate = place.firstSnapshot.date;

  return (
    <Outer>
      <DateTimeAgo>
        <TimeAgo date={new Date(snapshot.date)} formatter={timeAgoFormatter} />
      </DateTimeAgo>
      <DateString>
        <DateInputPlacer>
          {prettyDateTime(snapshot.date)}
          {enableDateChange && (
            <DateInput
              ref={dateRef}
              value={graphDate(date)}
              onChange={dateChange}
              onBlur={dateBlur}
              min={graphDate(minDate)}
              max={graphDate(new Date())}
            />
          )}
        </DateInputPlacer>
      </DateString>
    </Outer>
  );
}
