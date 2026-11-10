import { describe, expect, it } from 'vitest';

import {
  addList,
  closestTarget,
  createTimeline,
  nearbyLoads,
  photoTargets,
  stepTarget,
} from './timeline';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const LATEST = new Date('2026-11-09T12:00:00.000Z').getTime();
const FIRST = LATEST - 365 * DAY;

function snapshot(hoursBeforeLatest) {
  return {
    cuid: `h${hoursBeforeLatest}`,
    date: new Date(LATEST - hoursBeforeLatest * HOUR).toISOString(),
  };
}

const first = { cuid: 'first', date: new Date(FIRST).toISOString() };
const last = snapshot(0);

// One snapshot an hour, from `newest` hours back to `oldest` hours back.
function hourly(newest, oldest) {
  const list = [];
  for (let h = oldest; h >= newest; h--) {
    list.push(snapshot(h));
  }
  return list;
}

function list(newest, oldest) {
  return {
    from: new Date(LATEST - oldest * HOUR).toISOString(),
    to: new Date(LATEST - newest * HOUR).toISOString(),
    snapshots: hourly(newest, oldest),
  };
}

const start = () =>
  createTimeline({ firstSnapshot: first, lastSnapshot: last });
// The first week, as the page loads it.
const withWeek = () => addList(start(), list(0, 167));

describe('addList', () => {
  it('keeps snapshots sorted and once each, whatever order lists come in', () => {
    let timeline = addList(start(), list(0, 3));
    timeline = addList(timeline, list(48, 50));
    timeline = addList(timeline, list(2, 5));

    expect(timeline.snapshots.map((s) => s.cuid)).toEqual([
      'first',
      'h50',
      'h49',
      'h48',
      'h5',
      'h4',
      'h3',
      'h2',
      'h1',
      'h0',
    ]);
  });
});

describe('months that meet', () => {
  // Two months from the local database: the first ends one millisecond
  // before the second starts.
  const border = LATEST - 24 * HOUR;
  const older = snapshot(25);
  const newer = snapshot(23);

  function twoMonths() {
    let timeline = addList(start(), {
      from: new Date(border - 30 * DAY).toISOString(),
      to: new Date(border - 1).toISOString(),
      snapshots: [older],
    });

    return addList(timeline, {
      from: new Date(border).toISOString(),
      to: new Date(LATEST).toISOString(),
      snapshots: [newer],
    });
  }

  it('become one range', () => {
    expect(twoMonths().ranges).toContainEqual({
      from: border - 30 * DAY,
      to: Infinity,
    });
  });

  it('can be stepped across', () => {
    expect(stepTarget(twoMonths(), newer, -1)).toEqual({ snapshot: older });
    expect(stepTarget(twoMonths(), older, 1)).toEqual({ snapshot: newer });
  });

  it('stay apart when a millisecond is missing between them', () => {
    const timeline = addList(
      addList(start(), {
        from: new Date(border - 30 * DAY).toISOString(),
        to: new Date(border - 2).toISOString(),
        snapshots: [older],
      }),
      {
        from: new Date(border).toISOString(),
        to: new Date(LATEST).toISOString(),
        snapshots: [newer],
      }
    );

    expect(stepTarget(timeline, newer, -1).snapshot).toBeUndefined();
  });
});

describe('stepTarget', () => {
  it('steps to the neighbours inside a loaded week', () => {
    const timeline = withWeek();

    expect(stepTarget(timeline, snapshot(5), -1).snapshot).toEqual(snapshot(6));
    expect(stepTarget(timeline, snapshot(5), 1).snapshot).toEqual(snapshot(4));
  });

  it('asks for the week before when the start of the list is reached', () => {
    const timeline = withWeek();

    expect(stepTarget(timeline, snapshot(167), -1)).toEqual({
      load: [{ to: LATEST - 167 * HOUR }],
    });
  });

  it('does not step past the latest snapshot', () => {
    expect(stepTarget(withWeek(), last, 1)).toEqual({});
  });

  it('does not step before the first snapshot', () => {
    expect(stepTarget(withWeek(), first, -1)).toEqual({});
  });

  it('does not skip snapshots that are not loaded yet', () => {
    // A jump to a date loaded 48-50 hours back. Snapshots 6-47 hours back
    // are not loaded, so h48 is not the real neighbour of h50 going forward.
    let timeline = addList(start(), list(0, 5));
    timeline = addList(timeline, list(48, 50));

    expect(stepTarget(timeline, snapshot(48), 1)).toEqual({
      load: [{ from: LATEST - 48 * HOUR }],
    });
    expect(stepTarget(timeline, snapshot(5), -1)).toEqual({
      load: [{ to: LATEST - 5 * HOUR }],
    });
  });

  it('asks for the week before the latest snapshot before anything is loaded', () => {
    expect(stepTarget(start(), last, -1)).toEqual({
      load: [{ to: LATEST }],
    });
  });
});

describe('closestTarget', () => {
  it('finds the snapshot 24 hours back in the loaded week', () => {
    const timeline = withWeek();

    expect(closestTarget(timeline, LATEST - 24 * HOUR).snapshot).toEqual(
      snapshot(24)
    );
  });

  it('asks for the days around a date that is not loaded', () => {
    const date = LATEST - 30 * DAY;

    expect(closestTarget(withWeek(), date)).toEqual({
      load: [{ from: date - 3 * DAY, to: date + 3 * DAY }],
    });
  });

  it('is sure only when nothing closer can be missing', () => {
    // h10 is the closest known snapshot to 12 hours back, but h11-h13 are
    // not loaded, so one of them might be closer.
    const timeline = addList(start(), list(0, 10));

    expect(closestTarget(timeline, LATEST - 12 * HOUR).load).toHaveLength(1);
    expect(
      closestTarget(timeline, LATEST - 12 * HOUR, { settle: true }).snapshot
    ).toEqual(snapshot(10));
  });

  it('takes the snapshot across a gap when the gap is loaded', () => {
    // No snapshots between 10 and 100 hours back, and that is known.
    let timeline = addList(start(), list(0, 10));
    timeline = addList(timeline, {
      from: new Date(LATEST - 200 * HOUR).toISOString(),
      to: new Date(LATEST - 10 * HOUR).toISOString(),
      snapshots: hourly(100, 200),
    });

    expect(closestTarget(timeline, LATEST - 30 * HOUR).snapshot).toEqual(
      snapshot(10)
    );
  });

  it('looks past the days around a date when they have no snapshots', () => {
    // The box was off for months around the date.
    const date = LATEST - 200 * DAY;
    const before = {
      cuid: 'before',
      date: new Date(date - 35 * DAY).toISOString(),
    };
    const after = {
      cuid: 'after',
      date: new Date(date + 150 * DAY).toISOString(),
    };
    let timeline = addList(withWeek(), {
      from: new Date(date - 3 * DAY).toISOString(),
      to: new Date(date + 3 * DAY).toISOString(),
      snapshots: [],
    });

    expect(closestTarget(timeline, date)).toEqual({
      load: [{ to: date - 3 * DAY }, { from: date + 3 * DAY }],
    });

    timeline = addList(timeline, {
      from: null,
      to: new Date(date - 3 * DAY).toISOString(),
      snapshots: [before],
    });
    timeline = addList(timeline, {
      from: new Date(date + 3 * DAY).toISOString(),
      to: after.date,
      snapshots: [after],
    });

    expect(closestTarget(timeline, date).snapshot).toEqual(before);
  });
});

describe('nearbyLoads', () => {
  it('loads the first week when the page opens', () => {
    expect(nearbyLoads(start(), last)).toEqual([{ to: LATEST }]);
  });

  it('loads nothing more while the user is well inside the week', () => {
    expect(nearbyLoads(withWeek(), snapshot(48))).toEqual([]);
  });

  it('loads the week before when the user gets close to its start', () => {
    expect(nearbyLoads(withWeek(), snapshot(120))).toEqual([
      { to: LATEST - 167 * HOUR },
    ]);
  });

  it('loads both sides after a jump back in time', () => {
    const date = LATEST - 30 * DAY;
    const timeline = addList(withWeek(), {
      from: new Date(date - 3 * DAY).toISOString(),
      to: new Date(date + 3 * DAY).toISOString(),
      snapshots: [{ cuid: 'x', date: new Date(date).toISOString() }],
    });

    expect(nearbyLoads(timeline, { cuid: 'x', date })).toEqual([
      { to: date - 3 * DAY },
      { from: date + 3 * DAY },
    ]);
  });
});

describe('photoTargets', () => {
  it('starts with where each arrow goes, then a few more steps', () => {
    const { first: soon, later } = photoTargets(withWeek(), snapshot(30));

    expect(soon.map((s) => s.cuid)).toEqual(['h31', 'h54', 'h29', 'h6']);
    expect(later.map((s) => s.cuid)).toEqual([
      'h32',
      'h78',
      'h33',
      'h102',
      'h28',
      // 48 hours forward is past the latest snapshot, so the latest is closest.
      'h0',
    ]);
  });

  it('has nothing forward at the latest snapshot', () => {
    const { first: soon } = photoTargets(withWeek(), last);

    expect(soon.map((s) => s.cuid)).toEqual(['h1', 'h24']);
  });

  it('has nothing before the first week is loaded', () => {
    expect(photoTargets(start(), last)).toEqual({ first: [], later: [] });
  });
});
