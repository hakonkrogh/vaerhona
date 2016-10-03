import Place from '../models/place';
import { getLatestSnapshotForPlace, getSnapshotsRaw } from './snapshot.controller';
import cuid from 'cuid';
import config from '../config';

/**
 * Save a place
 * @param req
 * @param res
 * @returns void
 */
export function addPlace (req, res) {
  
  if (!req.body.place.name) {
    res.status(403).end();
  }

  addPlaceRaw(req.body.place)
    .then(saved => res.json({ place: saved }))
    .catch(err => res.status(500).send(err));
}

/**
 * Save a place
 * @param place
 * @returns Promise
 */
export function addPlaceRaw (place) {
  return new Promise((resolve, reject) => {
    
    if (!place || !place.name) {
      return reject('Missing place name');
    }
    
    if (config.PROTECTED_ROOT_NAMES.includes(place.name)) {
      return reject(`The name ${place.name} is protected and cannot be used`);
    }

    const newPlace = new Place(place);

    if (!newPlace.cuid) {
      newPlace.cuid = cuid();
    }

    newPlace.save((err, savedPlace) => {
      if (err) {
        return reject(err);
      }
      resolve(savedPlace);
    });
  });
}


/**
 * Gets all places
 * @param req
 * @param res
 * @returns void
 */
export function getPlaces (req, res) {
  Place.find().exec((err, places) => {
    if (err) {
      res.status(500).send(err);
    }
    res.json({ places });
  });
}

/**
 * Get a single place
 * @param req
 * @param res
 * @returns void
 */
export function getPlace (req, res) {
  
  if (!req.params.name) {
    res.status(403).end();
  }

  Place.findOne({ name: req.params.name }).exec((err, place) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json({ place });
  });
}

/**
 * Get the places to display on the front page
 * @param req
 * @param res
 * @returns void
 */
export function getFrontpagePlaces (req, res) {
  
  Place
  .find({
    isPublic: true
  })
  .limit(10)
  .exec((err, places) => {

    if (err) {
      return res.status(500).send(err);
    }

    let snaphotsGetter = [];
    let returnObj = { places: [] };

    // Get the latest snapshot for each place
    places.forEach(place => {
      snaphotsGetter.push(
        getLatestSnapshotForPlace(place)
        .then(snapshot => {
          if (snapshot) {
            returnObj.places.push({
              place,
              snapshot
            });
          }
        })
      );
    });

    Promise.all(snaphotsGetter).then(() => {
      res.json(returnObj);
    }, error => {
      return res.status(500).send(err);
    });

  });
}

export function getSelectedPlaceData (req, res) {

  if (!req.params.name) {
    res.status(403).end();
  }

  Place.findOne({ name: req.params.name }).exec((err, place) => {
    if (err) {
      return res.status(500).send(err);
    }

    getSnapshotsRaw({
      placeCuid: place.cuid,
      limit: 50
    })
    .then(snapshots => res.json({ place, snapshots }))
    .catch(err => res.status(500).send(err));
  });
}

/**
 * Delete a place
 * @param req
 * @param res
 * @returns void
 */
export function deletePlace (req, res) {

  if (!req.params.name) {
    res.status(403).end();
  }

  Place.findOne({ name: req.params.name }).exec((err, place) => {
    if (err) {
      res.status(500).send(err);
    }

    place.remove(() => {
      res.status(200).end();
    });
  });
}
