import test from 'ava';
import { actionTest } from 'redux-ava';

import {
  ADD_SNAPSHOT,
  DELETE_SNAPSHOT,
  ADD_SNAPSHOTS,
  addSnapshot,
  deleteSnapshot,
  addSnapshots,
} from '../SnapshotActions';

const snapshot = { cuid: 'f34gb2bh24b24b2', placeCuid: 'a34gb2bh24b24b2', temperature: 1, humidity: 2, pressure: 3, _id: 1 };

test('should return the correct type for addSnapshot', actionTest(
  addSnapshot,
  snapshot,
  { type: ADD_SNAPSHOT, snapshot },
));

test('should return the correct type for deleteSnapshot', actionTest(
  deleteSnapshot,
  snapshot.cuid,
  { type: DELETE_SNAPSHOT, cuid: snapshot.cuid },
));

test('should return the correct type for addSnapshots', actionTest(
  addSnapshots,
  [snapshot],
  { type: ADD_SNAPSHOTS, snapshots: [snapshot] },
));
