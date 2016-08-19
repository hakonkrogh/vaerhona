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

  const newPlace = new Place(req.body.place);

  newPlace.cuid = cuid();
  newPlace.save((err, saved) => {
    if (err) {
      res.status(500).send(err);
    }
    res.json({ place: saved });
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
