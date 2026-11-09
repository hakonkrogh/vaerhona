import { runWithDb } from './init';
import { snapshotModel, snapshotPlaceModel } from './mongo/models';
import { toSnapshotView } from './snapshot-view';
import { normalizeAndEnrichSnapshot } from './utils';

export const MAX_LIMIT = 500;

const LIST_FIELDS =
  'cuid placeCuid temperature humidity pressure dateAdded yrWeather';

function parseDate(value) {
  if (typeof value !== 'string' || !value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Reads the query of a snapshot list request.
 *
 * @returns {{ placeName: string, from: Date|null, to: Date, limit: number }
 *   | null} null if the query is not valid
 */
export function parseListQuery({ place, from, to, limit }) {
  const placeName = typeof place === 'string' ? place : '';
  const toDate = parseDate(to);
  const fromDate = parseDate(from);
  const limitNumber = Number(limit);

  if (
    !placeName ||
    placeName.length > 100 ||
    !toDate ||
    (from !== undefined && !fromDate) ||
    !Number.isInteger(limitNumber) ||
    limitNumber < 1 ||
    limitNumber > MAX_LIMIT
  ) {
    return null;
  }

  return { placeName, from: fromDate, to: toDate, limit: limitNumber };
}

function iso(date) {
  return new Date(date).toISOString();
}

/**
 * The part of time the list covers completely. There is no snapshot in it
 * that the list leaves out. `from: null` means the start of the place's
 * history.
 */
function coveredRange({ from, to, limit, rows }) {
  const full = rows.length === limit;

  if (from) {
    // The oldest snapshots from the start date. If the limit cut the list,
    // it is complete only up to the newest one it has.
    return {
      from: iso(from),
      to: iso(full ? rows[rows.length - 1].dateAdded : to),
    };
  }

  // The newest snapshots up to the end date.
  return { from: full ? iso(rows[0].dateAdded) : null, to: iso(to) };
}

/**
 * Snapshots of a place from `from` (or as far back as `limit` allows) up to
 * `to`, oldest first.
 *
 * The list is final when `to` is at or before the place's latest snapshot. A
 * box only adds snapshots dated now, which is after the latest snapshot, so a
 * final list can never change. A list that ends later could miss a snapshot
 * that has not been uploaded yet (SPEC.md, "What may be cached").
 *
 * @returns {Promise<{ final: boolean, list: object } | null>} null if there
 * is no such place
 */
export function getSnapshotList({ placeName, from, to, limit }) {
  return runWithDb(async () => {
    const place = await snapshotPlaceModel
      .findOne({ name: placeName })
      .select('cuid name lastSnapshot')
      .populate({ path: 'lastSnapshot', select: 'dateAdded' })
      .lean()
      .exec();

    if (!place) {
      return null;
    }

    const rows = await snapshotModel
      .find({
        placeCuid: place.cuid,
        dateAdded: from ? { $gte: from, $lte: to } : { $lte: to },
      })
      .select(LIST_FIELDS)
      // With no start date we want the newest snapshots before the end date.
      .sort(from ? 'dateAdded' : '-dateAdded')
      .limit(limit)
      .lean()
      .exec();

    if (!from) {
      rows.reverse();
    }

    const latestDate = place.lastSnapshot?.dateAdded;

    return {
      final: Boolean(latestDate) && to <= new Date(latestDate),
      list: {
        ...coveredRange({ from, to, limit, rows }),
        snapshots: rows.map((snapshot) =>
          toSnapshotView(
            normalizeAndEnrichSnapshot({ snapshot, place }),
            place.name
          )
        ),
      },
    };
  });
}
