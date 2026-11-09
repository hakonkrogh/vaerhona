// What the place page knows about a place's snapshots: the snapshots it has
// loaded, oldest first, and the parts of time it has loaded completely
// ("ranges"). Inside a range there is no snapshot the page does not have, so
// a neighbour found there is the real neighbour.
//
// Everything here is plain data in and out, so it can be tested without React
// or the network.

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// A jump to a date loads this much on each side of it.
const WINDOW_AROUND_DATE = 3 * DAY;

// When the user is this close to the end of what is loaded, the next part
// loads in the background. It is more than the window around a date, so a
// jump also loads the weeks on each side of it.
const PRELOAD_MARGIN = 4 * DAY;

const timeOf = (snapshot) => new Date(snapshot.date).getTime();

function mergeSnapshots(snapshots, incoming) {
  const byCuid = new Map();

  for (const snapshot of [...snapshots, ...incoming]) {
    byCuid.set(snapshot.cuid, snapshot);
  }

  return [...byCuid.values()].sort((a, b) => timeOf(a) - timeOf(b));
}

// Ranges are { from, to } in milliseconds, both included, sorted and not
// overlapping. An open end is -Infinity or Infinity.
function addRange(ranges, range) {
  let { from, to } = range;
  const result = [];

  for (const existing of ranges) {
    if (existing.to < from || existing.from > to) {
      result.push(existing);
    } else {
      from = Math.min(from, existing.from);
      to = Math.max(to, existing.to);
    }
  }

  result.push({ from, to });

  return result.sort((a, b) => a.from - b.from);
}

function rangeAt(ranges, time) {
  return ranges.find((range) => range.from <= time && time <= range.to);
}

function isCovered(ranges, from, to) {
  const range = rangeAt(ranges, from);

  return Boolean(range) && to <= range.to;
}

/**
 * Adds a list from the snapshot list API: its snapshots and the part of time
 * it covers. `from: null` is the start of the place's history.
 */
export function addList(timeline, { from, to, snapshots }) {
  return {
    snapshots: mergeSnapshots(timeline.snapshots, snapshots),
    ranges: addRange(timeline.ranges, {
      from: from == null ? -Infinity : new Date(from).getTime(),
      to: to == null ? Infinity : new Date(to).getTime(),
    }),
  };
}

/**
 * Starts with what the page has from the server. There is nothing to browse
 * to after the latest snapshot (rule P4) or before the first one.
 */
export function createTimeline({ firstSnapshot, lastSnapshot }) {
  let timeline = addList(
    { snapshots: [], ranges: [] },
    { from: lastSnapshot.date, to: null, snapshots: [lastSnapshot] }
  );

  if (firstSnapshot) {
    timeline = addList(timeline, {
      from: null,
      to: firstSnapshot.date,
      snapshots: [firstSnapshot],
    });
  }

  return timeline;
}

/**
 * The snapshot one step before (-1) or after (1) `current`.
 *
 * Like closestTarget, it returns `snapshot` if it is known, `load` with the
 * parts of time to load first if not, and neither if there is no such
 * snapshot. A part is { to } for the week before `to`, { from } for the week
 * after `from`, or { from, to } for everything between.
 *
 * @returns {{ snapshot?: object, load?: object[] }}
 */
export function stepTarget({ snapshots, ranges }, current, direction) {
  const time = timeOf(current);
  const index = snapshots.findIndex((s) => s.cuid === current.cuid);
  const next = index === -1 ? undefined : snapshots[index + direction];
  const range = rangeAt(ranges, time);
  const isEndOfHistory =
    direction < 0 ? range?.from === -Infinity : range?.to === Infinity;

  if (next) {
    const nextTime = timeOf(next);

    if (isCovered(ranges, Math.min(time, nextTime), Math.max(time, nextTime))) {
      return { snapshot: next };
    }
  } else if (isEndOfHistory) {
    return {};
  }

  return direction < 0
    ? { load: [{ to: range ? range.from : time }] }
    : { load: [{ from: range ? range.to : time }] };
}

function closestKnown(snapshots, time) {
  let closest;

  for (const snapshot of snapshots) {
    if (
      !closest ||
      Math.abs(timeOf(snapshot) - time) < Math.abs(timeOf(closest) - time)
    ) {
      closest = snapshot;
    }
  }

  return closest;
}

/**
 * The snapshot closest to a date. See stepTarget for what it returns.
 *
 * @param {{ settle?: boolean }} [options] settle: take the closest snapshot
 * that is known, even if one closer might not be loaded. A last resort, when
 * loading did not help.
 */
export function closestTarget({ snapshots, ranges }, date, options = {}) {
  const time = new Date(date).getTime();
  const closest = closestKnown(snapshots, time);
  const distance = closest ? Math.abs(timeOf(closest) - time) : Infinity;

  if (
    closest &&
    (options.settle || isCovered(ranges, time - distance, time + distance))
  ) {
    return { snapshot: closest };
  }

  const range = rangeAt(ranges, time);

  if (!range) {
    return {
      load: [
        { from: time - WINDOW_AROUND_DATE, to: time + WINDOW_AROUND_DATE },
      ],
    };
  }

  // The days around the date are loaded, but a closer snapshot could be past
  // them, across a gap when the box was off. A week before or after the gap
  // is one request however long the gap is.
  const load = [];

  if (range.from > time - distance) {
    load.push({ to: range.from });
  }
  if (range.to < time + distance) {
    load.push({ from: range.to });
  }

  return { load };
}

/**
 * What to load in the background so the next steps are ready: the next part
 * of time when `current` is close to the end of what is loaded.
 */
export function nearbyLoads({ ranges }, current) {
  const time = timeOf(current);
  const range = rangeAt(ranges, time);
  const loads = [];

  if (!range) {
    return loads;
  }
  if (range.from !== -Infinity && time - range.from < PRELOAD_MARGIN) {
    loads.push({ to: range.from });
  }
  if (range.to !== Infinity && range.to - time < PRELOAD_MARGIN) {
    loads.push({ from: range.to });
  }

  return loads;
}

/**
 * The snapshots the user is most likely to go to next, most likely first.
 * Only snapshots that are already known are included.
 *
 * @returns {{ first: object[], later: object[] }} first: where each arrow
 * goes. later: a few more steps back, and one more forward.
 */
export function photoTargets(timeline, current) {
  const time = timeOf(current);

  function steps(count) {
    let snapshot = current;

    for (let i = 0; i < Math.abs(count) && snapshot; i++) {
      snapshot = stepTarget(timeline, snapshot, Math.sign(count)).snapshot;
    }

    return snapshot;
  }

  function hours(count) {
    return closestTarget(timeline, time + count * HOUR).snapshot;
  }

  const seen = new Set([current.cuid]);
  const unique = (snapshots) =>
    snapshots.filter((snapshot) => {
      if (!snapshot || seen.has(snapshot.cuid)) {
        return false;
      }
      seen.add(snapshot.cuid);
      return true;
    });

  return {
    first: unique([steps(-1), hours(-24), steps(1), hours(24)]),
    later: unique([
      steps(-2),
      hours(-48),
      steps(-3),
      hours(-72),
      steps(2),
      hours(48),
    ]),
  };
}
