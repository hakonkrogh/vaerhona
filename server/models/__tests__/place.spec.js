import test from 'ava';
import request from 'supertest';
import app from '../../server';
import Place from '../place';
import { connectDB, dropDB } from '../../util/test-helpers';

// Initial places added into test db
const places = [
  new Place({ cuid: 'f34gb2bh24b24b2', name: 'Veggli' }),
  new Place({ cuid: 'f34gb2bh24b24b3', name: 'Ås' }),
];

test.beforeEach('connect and add two place entries', t => {
  connectDB(t, () => {
    Place.create(places, err => {
      if (err) t.fail('Unable to create places');
    });
  });
});

test.afterEach.always(t => {
  dropDB(t);
});

test.serial('Should correctly give number of places', async t => {
  t.plan(2);

  const res = await request(app)
    .get('/api/places')
    .set('Accept', 'application/json');

  t.is(res.status, 200);
  t.deepEqual(places.length, res.body.places.length);
});

test.serial('Should send correct data when queried against a cuid', async t => {
  t.plan(2);

  const place = new Place({ cuid: 'f34gb2bh24b24b2', name: 'Ås' });
  place.save();

  const res = await request(app)
    .get('/api/places/f34gb2bh24b24b2')
    .set('Accept', 'application/json');

  t.is(res.status, 200);
  t.is(res.body.place.name, place.name);
});

test.serial('Should correctly add a place', async t => {
  t.plan(2);

  const res = await request(app)
    .post('/api/places')
    .send({ place: { name: 'Ås' } })
    .set('Accept', 'application/json');

  t.is(res.status, 200);

  const savedPlace = await Place.findOne({ name: 'Ås' }).exec();
  t.is(savedPlace.name, 'Ås');
});

test.serial('Should correctly delete a place', async t => {
  t.plan(2);

  const place = new Place({ cuid: 'f34gb2bh24b24b2', name: 'Ås' });
  place.save();

  const res = await request(app)
    .delete(`/api/places/${place.cuid}`)
    .set('Accept', 'application/json');

  t.is(res.status, 200);

  const queriedPlace = await Place.findOne({ cuid: place.cuid }).exec();
  t.is(queriedSnapshotPlace, null);
});

