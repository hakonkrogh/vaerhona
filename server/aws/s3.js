import CWebp from 'cwebp';
import AWS from 'aws-sdk';
import imageSize from 'image-size';

import ImageCache from '../core/ImageCache';
const imageCache = new ImageCache();

import config from '../config';

AWS.config.loadFromPath('../__config/vaerhona/aws.config.json');

const s3 = new AWS.S3();

const cwebp = CWebp.CWebp;

/**
 * Takes a base64 image string and stores the required images to a S3 bucket
 * @param snapshot
 * @param place
 * @returns Promise
 */
export function saveImageFromSnapshot ({ snapshot, place }) {
  if (!snapshot.image) {
    return Promise.reject({
      message: 'snapshot.image is undefined',
      snapshot
    });
  }

  // Create buffer
  let imageBuffer = new Buffer.from(snapshot.image, 'base64');

  return uploadSingleImage({ place, snapshot, imageBuffer });
}

/**
 * Stores a single image buffer to a S3 bucket
 * @param snapshot
 * @param place
 * @param imageBuffer
 * @param fileType
 * @returns Promise
 */
function uploadSingleImage ({ place, snapshot, imageBuffer, fileType }) {

  return new Promise((resolve, reject) => {
  
    let { width, height, type } = imageSize(imageBuffer);

    // Convert buffer to webp
    if (type !== 'webp' && false) {

      type = 'webp';
      const encoder = new cwebp(imageBuffer);

      encoder.toBuffer((err, buffer) => {

        if (err) {
          return reject(err);
        }

        imageBuffer = buffer;
        
        upload();
      });
    } else {
      upload();
    }

    const Metadata = {
      width: width.toString(),
      height: height.toString(),
      type
    };

    function upload () {
      s3.upload({
        Bucket: config.aws.s3BucketName,
        Key: getRelativePathForImage({ place, snapshot, fileType }),
        Body: imageBuffer,
        Metadata
      }, {}, (err, data) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(data);
        }
      });
    }
  });
}

/**
 * Get a image
 * @param snapshot
 * @param place
 * @returns promise
 */
export function getImage ({ placeName, snapshot }) {
  
  let src = getRelativePathForImage({ placeName, snapshot });

  // Just serve from cache
  if (imageCache.includes({ src })) {
    return Promise.resolve(imageCache.get({ src }));
  }

  return new Promise((resolve, reject) => {

    /**
    * Determine if legacy extension should be checked first. All images up
    * til 2016-11-20 was stored with this, so we will use the snapshot
    * dateAdded to determine what to check for first
    **/
    let legacyExtension = false;
    if (new Date(snapshot.dateAdded) < new Date(2016, 10, 20)) {
      legacyExtension = true;
    }
    
    getImageFromS3({ legacyExtension })
      .then(endAndCache)
      .catch(() => {

        getImageFromS3({ legacyExtension: !legacyExtension })
          .then(endAndCache)
          .catch(reject);
      });

    function endAndCache (image) {
      imageCache.add({
        src,
        image
      });
      resolve(image);
    }
  });

  function getImageFromS3 ({ legacyExtension }) {
    return new Promise((resolve, reject) => {
      s3.getObject({
        Bucket: config.aws.s3BucketName,
        Key: getRelativePathForImage({ placeName, snapshot, legacyExtension })
      }, function (err, data) {
        if (err) {
          reject(err);
        }
        else {
          resolve(data);
        }
      });
    });
  }
}

/**
 * Returns the relative path for an image for a snapshot (ex: /test/1/30/cuid.jpg)
 * @param place
 * @param placeName
 * @param snapshot
 * @param legacyExtension
 * @returns string
*/
function getRelativePathForImage ({ place, placeName, snapshot, legacyExtension }) {
  
  const date = new Date(snapshot.dateAdded);
  let path = `${placeName || place.name}/${date.getFullYear()}/${date.getMonth() + 1}/${snapshot.cuid}`;

  if (legacyExtension) {
    path += '.jpg';
  }

  return path;
}