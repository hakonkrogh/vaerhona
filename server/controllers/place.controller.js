import Place from '../models/place';
import cuid from 'cuid';

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
      res.status(500).send(err);
    }
    res.json({ place });
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
