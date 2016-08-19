import Snapshot from '../models/snapshot';
import Place from '../models/place';
import cuid from 'cuid';
import fs from 'fs';
import { saveImageFromSnapshot } from '../aws/s3';

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
      return res.status(500).send('Error: place not found');
    }

    Snapshot.find({ placeCuid: place.cuid }).sort('-dateAdded').exec((err, snapshots) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.json({ snapshots });
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
  return addSnapshot(req, res);
}

/**
 * Save a snapshot without request or response
 * @param snapshot
 * @returns Promise
 */
export function addSnapshotRaw (snapshot = {}) {
  return new Promise((resolve, reject) => {

    if (!snapshot.placeCuid) {
        return reject({
          code: 403,
          message: 'Missing placeCuid'
        });
    }

    // Get place name
    Place.findOne({ cuid: snapshot.placeCuid }).exec((err, place) => {
      if (err) {
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

        newSnapshot.image = snapshot.image;

        // Store image to AWS S3
        saveImageFromSnapshot({
          place,
          snapshot: newSnapshot
        }).then(() => {
          resolve({ snapshot: saved });
        }).catch(err => {
          reject(err);
        });

      });
    });

  });
}

/**
 * Get a single snapshot
 * @param req
 * @param res
 * @returns void
 */
//export function getSnapshot (req, res) {
//  Snapshot.findOne({ cuid: req.params.cuid }).exec((err, snapshot) => {
//    if (err) {
//      res.status(500).send(err);
//    }
//    res.json({ snapshot });
//  });
//}

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
