import React, { useState, createRef, useEffect } from 'react';
import styled from 'styled-components';
import is from 'styled-is';
import TimeAgo from 'react-timeago';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import TaNo from 'react-timeago/lib/language-strings/no';

import { responsive, Temperature, Humidity, Pressure } from 'ui';
import { prettyDateTime, graphDate } from 'core/date';
import SnapshotImage from 'modules/snapshot-image';

import {
  DateTimeAgo,
  DateString,
  Values,
  DateInput,
  DateInputPlacer
} from './ui';

// Set up the time ago component
let timeAgoFormatter = buildFormatter(TaNo);

const Outer = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;

  ${is('compare')`
    ${responsive.smAndLess} {
      display: block;
      font-size: .85em;
    }
  `};
`;

const Top = styled.div`
  flex: 0 0 auto;
`;

const ImgOuter = styled.div`
  position: relative;
  flex: 1 1 auto;
  width: 100%;

  ${is('compare')`
      display: none;
  `};

  > img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const deviceDoesDateChangeOnBlur = (() => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.navigator.userAgent.includes('iPhone');
})();

const Image = ({ place, snapshot, compare, onDateChange }) => {
  const dateRef = createRef();
  const [enableDateChange, setEnableDateChange] = useState(true);
  const [date, setDate] = useState(snapshot.date);
  const now = new Date();

  function dateChange(e) {
    setDate(e.target.value);
    if (!deviceDoesDateChangeOnBlur) {
      onDateChange(e.target.value);
    }
  }

  function dateBlur(e) {
    if (deviceDoesDateChangeOnBlur) {
      onDateChange(date);
    }
  }

  useEffect(() => {
    if (dateRef.current) {
      if (dateRef.current.type !== 'date') {
        setEnableDateChange(false);
      }
    }
  }, [dateRef]);

  const minDate = place.firstSnapshot && place.firstSnapshot.date;

  return (
    <Outer compare={compare}>
      <Top>
        <DateTimeAgo compare={compare}>
          <TimeAgo
            date={new Date(snapshot.date)}
            formatter={timeAgoFormatter}
          />
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
                max={graphDate(now)}
              />
            )}
          </DateInputPlacer>
        </DateString>
        <Values compare={compare}>
          <Temperature {...snapshot} />
          <Humidity {...snapshot} />
          <Pressure {...snapshot} />
        </Values>
      </Top>
      <ImgOuter compare={compare}>
        <SnapshotImage {...snapshot} sizes="100vw" />
      </ImgOuter>
    </Outer>
  );
};

export default Image;
