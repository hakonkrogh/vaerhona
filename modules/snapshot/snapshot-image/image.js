import React from 'react';
import styled from 'styled-components';
import is from 'styled-is';
import TimeAgo from 'react-timeago';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import TaNo from 'react-timeago/lib/language-strings/no';

import { responsive, Temperature, Humidity, Pressure } from 'ui';
import { prettyDateTime } from 'core/date';
import SnapshotImage from 'modules/snapshot-image';

import { DateTimeAgo, DateString, Values } from './ui';

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
      font-size: .75em;
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
    ${responsive.smAndLess} {
      display: none;
    }
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

export default class Image extends React.PureComponent {
  render() {
    const { snapshot, compare } = this.props;
    return (
      <Outer compare={compare}>
        <Top>
          <DateTimeAgo compare={compare}>
            <TimeAgo
              date={new Date(snapshot.date)}
              formatter={timeAgoFormatter}
            />
          </DateTimeAgo>
          <DateString>{prettyDateTime(snapshot.date)}</DateString>
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
  }
}
