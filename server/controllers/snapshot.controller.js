import imageSize from 'image-size';

import Snapshot from '../models/snapshot';
import Place from '../models/place';
import cuid from 'cuid';
import fs from 'fs';
import { saveImageFromSnapshot, getImage } from '../aws/s3';
import { addPlaceRaw } from './place.controller';
import { dwebp } from '../core/webp';

/**
 * Get all snapshots
 * @param req
 * @param res
 * @returns void
 */
export function getSnapshots (req, res) {
  
  // Get place by name
  Place.findOne({ name: req.params.placeName }).exec((err, place) => {
    if (err) {
      return res.status(500).send(err);
    }

    if (!place) {
      return res.status(500).send(`Error: place ${req.params.placeName} not found!`);
    }

    getSnapshotsRaw({
      placeCuid: place.cuid,
      limit: req.query.limit
    })
    .then(snapshots => res.json({ snapshots }))
    .catch(err => res.status(500).send(err));
  });
}

/**
 * Get snapshots
 * @param placeCuid
 * @returns Promise
 */
export function getSnapshotsRaw ({ placeCuid, limit, sort }) {
  return new Promise((resolve, reject) => {

    let query = {
      placeCuid
    };
    
    let q = Snapshot.find(query);

    if (sort) {
      q = q.sort(sort);
    } else {
      q = q.sort({ dateAdded: -1 });
    }

    if (typeof limit === 'number') {
      q = q.limit(limit);
    }
    
    q.exec((err, snapshots) => {

      if (err) {
        return reject(err);
      }
      
      resolve(snapshots.map(item => normalizeSnapshot(item)).reverse());
    });

  });
}

/**
 * Get all snapshots (legacy method used by old værhøna.no)
 * @param req
 * @param res
 * @returns void
 */
export function getSnapshotsLegacy (req, res) {
  
  // Get place by name
  Place.findOne({ name: req.params.placeName }).exec((err, place) => {
    if (err) {
      return res.status(500).send(err);
    }

    if (!place) {
      return res.status(500).send(`Error: place not found!`);
    }

    Snapshot.find({ placeCuid: place.cuid }).sort('dateAdded').exec((err, snapshots) => {
      if (err) {
        return res.status(500).send(err);
      }

      res.jsonp({
        success: true,
        message: '',
        firstSnapshotTime: Math.floor(new Date(snapshots[snapshots.length - 1].dateAdded).getTime() / 1000),
        data: snapshots.map(item => {
          let snp = {};
          snp.time = Math.floor(new Date(item.dateAdded).getTime() / 1000);
          snp.outside_temperature = item.temperature;
          snp.outside_pressure = item.pressure;
          snp.outside_humidity = item.humidity;
          snp.outside_altitude = 0;
          snp.image = item.cuid + '.jpg';
          snp.image_base64 = null;
          snp.motion_event = 0;
          snp.complete = "1";
          snp.cuid = item.cuid;
          return normalizeSnapshot(snp);
        })
      });
    });
  });
}

/**
 * Save a snapshot
 * @param req
 * @param res
 * @returns Promise
 */
export function addSnapshot (req, res) {
  return addSnapshotRaw(req.body.snapshot)
  .then(snapshot => {

    // This property indicates the WS app version
    // req.body.appVersion

    // This property tells you the key names for the wifi network added by the WS
    // req.body.wifiNetworks

    res.json({
      snapshot,
      success: true, // old API props
      message: '' // old API props
    });

    // The signature for sending back the new app version to the weather station
    //appUpdate: {
    //  path: 'http://path-to-new-app.tar.gz',
    //  version: '99'
    //}

    // The signature for adding a new WIFI access point
    /*wifiUpdate = {
      // Internal name for the network
      Id: "some-unique-id",
      ssid: "the-ssid",
      psk: "the-password-psk",
      protocol: "WPA",
      keyManagement: "WPA-PSK",
      pairwise: "TKIP",
      authorization: "OPEN",

      // If the SSID is hidden or not
      scan_ssid: false,

      // Remove the old stored wifi networks?
      removeOld: false
    };*/
  })
  .catch(err => {
    res.status(err.code).send(err.message);
  });
}

/**
 * Save a snapshot (legacy entry)
 * @param req
 * @param res
 * @returns Promise
 */
export function addSnapshotLegacy (req, res) {

  const OLD_PLACES = [
    { placeId: -1, name: 'test' },
    { placeId: 1,  name: 'veggli' },
    { placeId: 2,  name: 'buvassbrenna' },
    { placeId: 3,  name: 'tornes' }
  ];
  Object.freeze(OLD_PLACES);

  const oldPlace = OLD_PLACES.find(place => place.placeId == req.body.placeId);

  if (!oldPlace) {
    return res.status(500).send('Error: place not found');
  }

  Place.findOne({ name: oldPlace.name }).exec((err, place) => {
    if (err) {
      return res.status(500).send(err);
    }

    if (place) {
      save({ place });
    }

    // The place was not found. Lets add it!
    else {
      addPlaceRaw({ name: oldPlace.name, isPublic: true })
        .then(place => save({ place }))
        .catch(err => res.status(500).send(err));
    }
  });

  function save ({ place }) {
    const snapshot = {
      placeCuid: place.cuid,
      temperature: req.body.outsideTemperature,
      pressure: req.body.outsidePressure,
      humidity: req.body.outsideHumidity,
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
  }
}

/**
 * Save a snapshot without request or response
 * @param snapshot
 * @returns Promise
 */
export function addSnapshotRaw (snapshot = {}) {
  return new Promise((resolve, reject) => {
    console.log('Add snapshot!');

    if (!snapshot.placeCuid) {
        console.log('Missing placeCuid');
        return reject({
          code: 403,
          message: 'Missing placeCuid'
        });
    }

    // Get place name
    Place.findOne({ cuid: snapshot.placeCuid }).exec((err, place) => {
      if (err) {
        console.log('Could not find place name from placeCuid', snapshot.placeCuid);
        return reject({
          code: 500,
          message: 'Could not find place name from placeCuid'
        });
      }

      const newSnapshot = new Snapshot(snapshot);

      newSnapshot.cuid = cuid();
      newSnapshot.save((err, saved) => {
        if (err) {
          return reject({
            code: 500,
            message: 'Error while saving snapshot'
          });
        }

        // Store image
        if (snapshot.image) {
          newSnapshot.image = snapshot.image;

          saveImageFromSnapshot({
            place,
            snapshot: newSnapshot
          }).then(() => {
            resolve({ snapshot: saved });
          }).catch(error => {
            console.log(error);
            reject({
              code: 500,
              message: 'Error while storing image to AWS S3 bucket',
              error
            });
          });
        } else {
          resolve({ snapshot: saved });
        }

      });
    });

  });
}

/**
 * Get the latest snapshot for a given place
 * @param place
 * @returns Prmomise
 */
export function getLatestSnapshotForPlace (place) {
  return new Promise((resolve, reject) => {

    if (!place || !place.cuid) {
      return reject('Place is not defined correctly');
    }

    Snapshot.findOne({ placeCuid: place.cuid }).sort('-dateAdded').exec((err, snapshot) => {
      
      if (err) {
        return reject(err);
      }

      resolve(normalizeSnapshot(snapshot));
    });
  })
}

/**
 * Normalize values for a snapshot
 * @param snapshot
 * @returns object
 */
function normalizeSnapshot (snapshot) {

  if (!snapshot) {
    return;
  }

  snapshot.temperature = (Math.round(snapshot.temperature * 10) / 10);
  snapshot.humidity = (Math.round(snapshot.humidity * 10) / 10);
  snapshot.pressure = (Math.round(snapshot.pressure * 10) / 10);

  return snapshot;
}

/**
 * Delete a snapshot
 * @param req
 * @param res
 * @returns void
 */
export function deleteSnapshot (req, res) {
  Snapshot.findOne({ cuid: req.params.cuid }).exec((err, snapshot) => {
    if (err) {
      res.status(500).send(err);
    }

    snapshot.remove(() => {
      res.status(200).end();
    });
  });
}

/**
 * Get a snapshot image
 * @param req
 * @param res
 * @returns void
 */
export function getSnapshotImage (req, res) {
  
  if (!req.params.placeName || !req.params.cuid) {
    res.status(422).send('Error: Missing required parameters');
  }

  Snapshot.findOne({ cuid: req.params.cuid }).exec((err, snapshot) => {
    
    if (err) {
      return res.status(500).send(err);
    }

    if (!snapshot) {
      return res.status(404).send('Snapshot not found');
    }

    getImage({
      placeName: req.params.placeName,
      snapshot
    })
    .then((image) => {

      let { width, height, type } = image.Metadata;

      // Serve PNG to poor browser that don't understand webp
      const accept = req.get('Accept');
      if (type === 'webp' && accept.indexOf('image/webp') === -1) {
        dwebp
          .toBuffer({ buffer: image.Body })
          .then((buffer) => {
            type = 'png';
            image.Body = buffer;
            end();
          })
          .catch((err) => {
            res.status(500).send(err);
          });
      } else {
        end();
      }

      function end () {
        res.set({
          'Content-Type': !type || type === 'jpg' ? 'image/jpeg' : 'image/' + type,
          'Cache-Control': 'public, max-age=31557600',
          'ETag': snapshot.cuid
        });
        res.end(image.Body, 'binary');
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
    
  });
}
