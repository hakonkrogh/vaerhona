import React from "react";
import styled from "styled-components";
import TimeAgo from "react-timeago";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import TaNo from "react-timeago/lib/language-strings/no";

import { prettyDateTime } from "core/date";
import SnapshotImage from "modules/snapshot-image";

import { DateTimeAgo, DateString, Values } from "./ui";

// Set up the time ago component
let timeAgoFormatter = buildFormatter(TaNo);

const Outer = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ImgOuter = styled.div`
  position: relative;
  flex: 1 1 auto;
  width: 100%;

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
    const { snapshot } = this.props;
    return (
      <Outer>
        <DateTimeAgo>
          <TimeAgo
            date={new Date(snapshot.date)}
            formatter={timeAgoFormatter}
          />
        </DateTimeAgo>
        <DateString>{prettyDateTime(snapshot.date)}</DateString>
        <Values>
          <span>
            {snapshot.temperature}
            &#8451;
          </span>
          <span>{snapshot.humidity}%</span>
          <span>
            {snapshot.pressure}
            hPa
          </span>
        </Values>
        <ImgOuter>
          <SnapshotImage {...snapshot} sizes="100vw" />
        </ImgOuter>
      </Outer>
    );
  }
}
