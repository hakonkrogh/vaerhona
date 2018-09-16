import React, { Component } from "react";
import keycode from "keycode";
import TimeAgo from "react-timeago";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import TaNo from "react-timeago/lib/language-strings/no";

import { prettyDateTime } from "core/date";
import { Button, Arrow } from "ui";

import { Outer, Inner, DateTimeAgo, Values, DateString, Bottom } from "./ui";
import Image from "./image";

// Set up the time ago component
let timeAgoFormatter = buildFormatter(TaNo);

export default class SnapshotImage extends Component {
  constructor(props) {
    super(props);

    const { snapshots = [] } = props;

    let from = new Date();
    let to = new Date();
    if (snapshots.length) {
      from = new Date(snapshots[0].date);
      to = new Date(snapshots[snapshots.length - 1].date);
    }

    this.state = {
      selectedSnapshot: snapshots[snapshots.length - 1],
      loadingDir: 0,
      from,
      to
    };
  }

  getCurrentIndex = () =>
    this.props.snapshots.findIndex(
      s => s.cuid === this.state.selectedSnapshot.cuid
    );

  go = (dir, comingFromDataLoad) => {
    const { snapshots } = this.props;

    const currentIndex = this.getCurrentIndex();
    let newIndex = currentIndex + dir;

    if (comingFromDataLoad) {
      if (dir > 0 && newIndex > snapshots.length - 1) {
        newIndex = snapshots.length - 1;
      } else if (dir < 0 && newIndex < 0) {
        newIndex = 0;
      }
    }

    if (snapshots[newIndex]) {
      return this.setState({
        selectedSnapshot: snapshots[newIndex]
      });
    }

    if (!comingFromDataLoad) {
      this.loadMoreSnapshots(dir);
    }
  };

  goBackOneHour = () => this.go(-1);
  goForwardOneHour = () => this.go(1);
  goBackOneDay = () => this.go(-24);
  goForwardOneDay = () => this.go(24);

  loadMoreSnapshots = async dir => {
    if (this.state.loadingDir === 0) {
      await this.ss({
        loadingDir: dir
      });

      let from;
      let to;

      if (dir < 0) {
        // Load older
        from = new Date(this.state.from.getTime());
        from.setDate(from.getDate() - 1);
        to = new Date(this.state.from.getTime());

        this.ss({
          from
        });
      } else {
        // Load newer
        from = new Date(this.state.to.getTime());
        to = new Date(this.state.to.getTime());
        to.setDate(to.getDate() + 1);

        this.ss({
          to
        });
      }

      try {
        console.log({ from, to });
        await this.props.loadMoreSnapshots({ from, to });
      } catch (e) {
        console.log(e);
      }

      await this.ss({
        loadingDir: 0,
        from,
        to
      });

      this.go(dir, true);
    }
  };

  ss = s => new Promise(r => this.setState(s, r));

  render() {
    const { place } = this.props;
    const { selectedSnapshot, loadingDir } = this.state;

    if (!selectedSnapshot) {
      return (
        <Outer>
          <Inner>No snapshots found for {place.name}</Inner>
        </Outer>
      );
    }

    return (
      <Outer>
        <Inner>
          <DateTimeAgo>
            <TimeAgo
              date={new Date(selectedSnapshot.date)}
              formatter={timeAgoFormatter}
            />
          </DateTimeAgo>
          <DateString>{prettyDateTime(selectedSnapshot.date)}</DateString>
          <Values>
            <span>
              {selectedSnapshot.temperature}
              &#8451;
            </span>
            <span>{selectedSnapshot.humidity}%</span>
            <span>
              {selectedSnapshot.pressure}
              hPa
            </span>
          </Values>

          <Image snapshot={selectedSnapshot} place={place} />
          <Bottom>
            <span>
              <Button
                clean
                onClick={this.goBackOneDay}
                loading={loadingDir === -24}
              >
                <Arrow left />
                <Arrow left />
              </Button>
              <Button
                clean
                onClick={this.goBackOneHour}
                loading={loadingDir === -1}
              >
                <Arrow left />
              </Button>
            </span>
            <span>
              <Button
                clean
                onClick={this.goForwardOneHour}
                loading={loadingDir === 1}
              >
                <Arrow />
              </Button>
              <Button
                clean
                onClick={this.goForwardOneDay}
                loading={loadingDir === 24}
              >
                <Arrow />
                <Arrow />
              </Button>
            </span>
          </Bottom>
        </Inner>
      </Outer>
    );
  }
}
