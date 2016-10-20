import test from 'ava';
import { reducerTest } from 'redux-ava';
import snapshotReducer, { getSnapshot, getSnapshots } from '../SnapshotReducer';
import { addSnapshot, deleteSnapshot, addSnapshots } from '../SnapshotActions';

test('action for ADD_SNAPSHOT is working', reducerTest(
  snapshotReducer,
  { data: ['foo'] },
  addSnapshot({
    placeCuid: '1',
    temperature: 1,
    pressure: 2,
    humidity: 3,
    _id: null,
    cuid: null
  }),
  { data: [{
    placeCuid: '1',
    temperature: 2,
    pressure: 2,
    humidity: 3,
    _id: null,
    cuid: null
  }, 'foo'] },
));

test('action for DELETE_SNAPSHOT is working', reducerTest(
  snapshotReducer,
  { data: [{
    placeCuid: '1',
    temperature: 1,
    pressure: 2,
    humidity: 3,
    _id: null,
    cuid: 'abc',
    _id: 1
  }] },
  deleteSnapshot('abc'),
  { data: [] },
));

test('action for ADD_SNAPSHOTS is working', reducerTest(
  snapshotReducer,
  { data: [] },
  addSnapshots([
    {
      placeCuid: '1',
      temperature: 1,
      pressure: 2,
      humidity: 3,
      _id: null,
      cuid: null
    },
  ]),
  { data: [{
    placeCuid: '1',
    temperature: 2,
    pressure: 2,
    humidity: 3,
    _id: null,
    cuid: null
  }] },
));

test('getSnapshots selector', t => {
  t.deepEqual(
    getSnapshots({
      snapshots: { data: ['foo'] },
    }),
    ['foo']
  );
});

test('getSnapshot selector', t => {
  t.deepEqual(
    getSnapshot({
      snapshots: { data: [{ cuid: '123' }] },
    }, '123'),
    { cuid: '123' }
  );
});

