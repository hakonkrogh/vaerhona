import {
  MAX_VALUES_SPAN,
  toColumns,
  VALUES_VERSION,
} from '../core/snapshot-values';

import { runWithDb } from './init';
import { snapshotModel, snapshotPlaceModel } from './mongo/models';
import { getPlaceImageBase, toSnapshotView } from './snapshot-view';
import { normalizeAndEnrichSnapshot } from './utils';

// A month of hourly snapshots is about 740. This is a safety limit for a box
// that uploaded much more often. An answer that hits it covers less time, and
// the browser asks for the rest.
export const ROW_LIMIT = 2000;

const VALUE_FIELDS =
  'cuid placeCuid temperature humidity pressure dateAdded yrWeather';

function parseDate(value) {
  if (typeof value !== 'string' || !value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Reads the query of a snapshot values request.
 *
 * @returns {{ placeName: string, from: Date, to: Date } | null} null if the
 * query is not valid
 */
export function parseValuesQuery({ place, from, to }) {
  const placeName = typeof place === 'string' ? place : '';
  const fromDate = parseDate(from);
  const toDate = parseDate(to);

  if (
    !placeName ||
    placeName.length > 100 ||
    !fromDate ||
    !toDate ||
    fromDate > toDate ||
    toDate - fromDate > MAX_VALUES_SPAN
  ) {
    return null;
  }

  return { placeName, from: fromDate, to: toDate };
}

/**
 * The values of every snapshot of a place from `from` to `to`, in columns
 * (see core/snapshot-values.js).
 *
 * The answer is final when `to` is at or before the place's latest snapshot,
 * by the same rule as snapshot lists (see services/snapshot-list.js).
 *
 * @returns {Promise<{ final: boolean, values: object } | null>} null if there
 * is no such place
 */
export function getSnapshotValues({ placeName, from, to }) {
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
      .find({ placeCuid: place.cuid, dateAdded: { $gte: from, $lte: to } })
      .select(VALUE_FIELDS)
      .sort('dateAdded')
      .limit(ROW_LIMIT)
      .lean()
      .exec();

    const latestDate = place.lastSnapshot?.dateAdded;
    // If the limit cut the answer, it is complete only up to its newest
    // snapshot.
    const coveredTo =
      rows.length === ROW_LIMIT ? rows[rows.length - 1].dateAdded : to;

    return {
      final: Boolean(latestDate) && to <= new Date(latestDate),
      values: {
        v: VALUES_VERSION,
        from: from.toISOString(),
        to: new Date(coveredTo).toISOString(),
        imageBase: getPlaceImageBase(place.name),
        ...toColumns(
          rows.map((snapshot) =>
            toSnapshotView(
              normalizeAndEnrichSnapshot({ snapshot, place }),
              place.name
            )
          )
        ),
      },
    };
  });
}
