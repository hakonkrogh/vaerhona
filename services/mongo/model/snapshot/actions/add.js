/* eslint-disable no-use-before-define */
import cuid from 'cuid';

import S3 from '../../../aws/s3';
import PlaceFacade from '../../snapshot-place/facade';
import facade from '../facade';

function lg(msg) {
  console.log(`snapshot::add::${msg}`);
}

export const addSnapshot = (req, res) =>
  addSnapshotRaw(req.body.snapshot)
    .then(snapshot => {
      res.json({
        snapshot,
        success: true, // old API props
        message: '' // old API props
      });
    })
    .catch(e =>
      res.status(e.code || 500).send(e.message || 'Could not save snapshot')
    );

export const addSnapshotLegacy = (req, res) => {
  const save = ({ place }) => {
    const snapshot = {
      placeCuid: place.cuid,
      temperature: req.body.outsideTemperature || req.body.temperature,
      pressure: req.body.outsidePressure || req.body.pressure,
      humidity: req.body.outsideHumidity || req.body.humidity,
      image: req.body.image
    };

    addSnapshotRaw(snapshot)
      .then(() => {
        res.json({
          success: true,
          message: ''
        });
      })
      .catch(({ status, message }) => {
        res.json({
          success: false,
          message,
          status
        });
      });
  };

  const oldPlace = [
    { placeId: -1, name: 'test' },
    { placeId: 1, name: 'veggli' },
    { placeId: 2, name: 'buvassbrenna' },
    { placeId: 3, name: 'tornes' }
    // eslint-disable-next-line eqeqeq
  ].find(place => place.placeId == req.body.placeId);

  if (!oldPlace) {
    return res.status(500).send('Error: place not found');
  }

  PlaceFacade.findOne({ name: oldPlace.name })
    .then(place => {
      if (place) {
        save({ place });
      } else {
        // The place was not found. Lets add it!
        PlaceFacade.create({ name: oldPlace.name, isPublic: true })
          .then(place => save({ place }))
          .catch(err => res.status(500).send(err));
      }
    })
    .catch(err => res.status(500).send(err));
};

const addSnapshotRaw = (snapshot = {}) =>
  new Promise((resolve, reject) => {
    if (!snapshot.placeCuid) {
      return reject({
        code: 403,
        message: 'Missing placeCuid'
      });
    }

    let place;
    let saved;
    snapshot.cuid = cuid();
    PlaceFacade.findOne({ cuid: snapshot.placeCuid })
      .then(p => (place = p))
      .then(() => facade.create(snapshot))
      .then(s => (saved = s))
      .then(() => {
        if (!snapshot.image) {
          lg('no image in snapshot');
          return resolve({ snapshot: saved });
        }

        lg('image in snapshot');

        saved.image = snapshot.image;
        return S3.saveImageFromSnapshot({
          place,
          snapshot: saved
        });
      })
      .then(s => {
        lg(s);
        resolve({ snapshot: saved });
      })
      .catch(error => {
        lg(error);
        reject({
          code: 500,
          message: 'Error while saving snapshot',
          error
        });
      });
  });
