import React, { useState, createRef, useEffect } from 'react';
import TimeAgo from 'react-timeago';
import styled from 'styled-components';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import TaNo from 'react-timeago/lib/language-strings/no';

import { Temperature, Humidity, Pressure } from 'ui';
import { prettyDateTime, graphDate } from 'core/date';

const deviceDoesDateChangeOnBlur = (() => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.navigator.userAgent.includes('iPhone');
})();

// Set up the time ago component
let timeAgoFormatter = buildFormatter(TaNo);

const Top = styled.div`
  flex: 0 0 auto;
  position: relative;
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
  margin-bottom: 15px;
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
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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

const Values = styled.div`
  flex: 0 0 auto;
  display: flex;
  justify-content: space-around;
  font-size: 1.5em;
  color: #555;
  max-width: 500px;
  margin: 0 auto;

  > span {
    margin: 0 20px;
    text-align: center;
    min-width: 80px;
  }
`;

export default function Metadata({ snapshot, onDateChange, place }) {
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
    <Top>
      <DateTimeAgo>
        <TimeAgo date={new Date(snapshot.date)} formatter={timeAgoFormatter} />
      </DateTimeAgo>
      <DateString>
        <DateInputPlacer>{prettyDateTime(snapshot.date)}</DateInputPlacer>
      </DateString>
      <Values>
        <Temperature {...snapshot} />
        <Humidity {...snapshot} />
        <Pressure {...snapshot} />
      </Values>
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
    </Top>
  );
}
