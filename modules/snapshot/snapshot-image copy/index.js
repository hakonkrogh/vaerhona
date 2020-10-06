import React, { Component } from 'react';

import { Button, IconArrow } from 'ui';
import { getClosestSnapshot } from 'core/utils';

import { Outer, Inner, Images, Bottom } from './ui';
import Image from './image';
import SplitImage from './split-image';

export default class SnapshotImage extends Component {
  state = {
    loadingDir: 0,
  };

  getCurrentIndex = () =>
    this.props.snapshots.findIndex(
      (s) => s.cuid === this.props.currentSnapshot.cuid
    );

  go = (dir, comingFromDataLoad) => {
    const { snapshots, setCurrentSnapshot } = this.props;

    const currentIndex = this.getCurrentIndex();

    let newIndex = currentIndex + dir;
    if (dir >= 0 && dir <= snapshots.length - 1 && Math.abs(dir) === 24) {
      const currentDate = new Date(snapshots[currentIndex].date);
      currentDate.setHours(currentDate.getHours() + dir);
      const snapshot = getClosestSnapshot({
        dateToBeCloseTo: currentDate,
        snapshots,
      });
      newIndex = snapshots.findIndex((s) => s === snapshot);
    }

    if (comingFromDataLoad) {
      if (dir > 0 && newIndex > snapshots.length - 1) {
        newIndex = snapshots.length - 1;
      } else if (dir < 0 && newIndex < 0) {
        newIndex = 0;
      }
    }

    const newSnapshot = snapshots[newIndex];
    if (newSnapshot) {
      return void setCurrentSnapshot(newSnapshot);
    }

    if (!comingFromDataLoad) {
      this.loadMoreSnapshots(dir);
    }
  };

  goBackOneHour = () => this.go(-1);
  goForwardOneHour = () => this.go(1);
  goBackOneDay = () => this.go(-24);
  goForwardOneDay = () => this.go(24);

  loadMoreSnapshots = async (dir) => {
    if (this.state.loadingDir === 0) {
      await this.ss({
        loadingDir: dir,
      });

      let from;
      let to;

      const { snapshots } = this.props;

      if (dir < 0) {
        // Load older
        const [first] = snapshots;
        to = new Date(first.date).toISOString();
      } else {
        // Load newer
        const last = snapshots[snapshots.length - 1];
        from = new Date(last.date).toISOString();
      }

      try {
        await this.props.loadMoreSnapshots({ from, to, limit: 24 });
      } catch (e) {
        console.log(e);
      }

      await this.ss({
        loadingDir: 0,
      });

      this.go(dir, true);
    }
  };

  onDateChange = (date) => {
    this.changeToSpecificDate = new Date(date);

    this.props.onDateChange(this.changeToSpecificDate);
  };

  ss = (s) => new Promise((r) => this.setState(s, r));

  render() {
    const { place, compare, currentSnapshot, compareSnapshot } = this.props;
    const { loadingDir } = this.state;

    if (!currentSnapshot) {
      return (
        <Outer>
          <Inner>No snapshots found for {place.name}</Inner>
        </Outer>
      );
    }

    return (
      <Outer>
        <Inner>
          <Images compare={compare}>
            {!compare ? (
              <Image
                snapshot={currentSnapshot}
                place={place}
                onDateChange={this.onDateChange}
              />
            ) : (
              <>
                <Image compare snapshot={compareSnapshot} place={place} />
                <Image compare snapshot={currentSnapshot} place={place} />
              </>
            )}
          </Images>
          {compare && (
            <SplitImage
              snapshot={currentSnapshot}
              compareSnapshot={compareSnapshot}
            />
          )}
          <Bottom>
            <span>
              <Button
                clean
                onClick={this.goBackOneDay}
                loading={loadingDir === -24}
              >
                <IconArrow left />
                <IconArrow left />
              </Button>
              <Button
                clean
                onClick={this.goBackOneHour}
                loading={loadingDir === -1}
              >
                <IconArrow left />
              </Button>
            </span>
            <span>
              <Button
                clean
                onClick={this.goForwardOneHour}
                loading={loadingDir === 1}
              >
                <IconArrow />
              </Button>
              <Button
                clean
                onClick={this.goForwardOneDay}
                loading={loadingDir === 24}
              >
                <IconArrow />
                <IconArrow />
              </Button>
            </span>
          </Bottom>
        </Inner>
      </Outer>
    );
  }
}
