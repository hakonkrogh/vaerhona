import test from 'ava';
import request from 'supertest';
import app from '../../server';
import Snapshot from '../snapshot';
import { connectDB, dropDB } from '../../util/test-helpers';

// Initial snapshots added into test db
const snapshots = [
  new Snapshot({ cuid: 'f34gb2bh24b24b2', placeCuid: 'a34gb2bh24b24b2', temperature: 12.7, pressure: 926, humidity: 84.1 }),
  new Snapshot({ cuid: 'f34gb2bh24b24b3', placeCuid: 'a34gb2bh24b24b2', temperature: -4, pressure: 1020, humidity: 91.4 }),
];

test.beforeEach('connect and add two snapshot entries', t => {
  connectDB(t, () => {
    Snapshot.create(snapshots, err => {
      if (err) t.fail('Unable to create snapshots');
    });
  });
});

test.afterEach.always(t => {
  dropDB(t);
});

test.serial('Should correctly give number of Snapshots', async t => {
  t.plan(2);

  const res = await request(app)
    .get('/api/snapshots')
    .set('Accept', 'application/json');

  t.is(res.status, 200);
  t.deepEqual(snapshots.length, res.body.snapshots.length);
});

test.serial('Should send correct data when queried against a cuid', async t => {
  t.plan(2);

  const snapshot = new Snapshot({ cuid: 'f34gb2bh24b24b2', placeCuid: 'a34gb2bh24b24b2', temperature: 1, pressure: 900, humidity: 90 });
  snapshot.save();

  const res = await request(app)
    .get('/api/snapshots/f34gb2bh24b24b2')
    .set('Accept', 'application/json');

  t.is(res.status, 200);
  t.is(res.body.snapshot.temperature, snapshot.temperature);
});

test.serial('Should correctly add a snapshot', async t => {
  t.plan(2);

  const res = await request(app)
    .post('/api/snapshots')
    .send({ snapshot: { temperature: 1, humidity: 0, pressure: 1000 } })
    .set('Accept', 'application/json');

  t.is(res.status, 200);

  const savedSnapshot = await Snapshot.findOne({ humidity: 0 }).exec();
  t.is(savedSnapshot.humidity, 0);
});

test.serial('Should correctly delete a snapshot', async t => {
  t.plan(2);

  const snapshot = new Snapshot({ cuid: 'f34gb2bh24b24b2', placeCuid: 'a34gb2bh24b24b2', temperature: 1, humidity: 100, pressure: 1000 });
  snapshot.save();

  const res = await request(app)
    .delete(`/api/snapshots/${snapshot.cuid}`)
    .set('Accept', 'application/json');

  t.is(res.status, 200);

  const queriedSnapshot = await Snapshot.findOne({ cuid: snapshot.cuid }).exec();
  t.is(queriedSnapshot, null);
});

