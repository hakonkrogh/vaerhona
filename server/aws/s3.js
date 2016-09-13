import AWS from 'aws-sdk';
import config from '../config';
import { getRelativePathForImage } from '../../shared/aws/s3';
import isWebp from 'is-webp';

if (process.env.NODE_ENV === 'production') {
  AWS.config.loadFromPath('../__config/vaerhona/aws.config.production.json');
}
else {
  AWS.config.loadFromPath('../__config/vaerhona/aws.config.development.json');
}

/**
 * Takes a base64 image string and stores the required images to a S3 bucket
 * @param snapshot
 * @param place
 * @returns Promise
 */
export function saveImageFromSnapshot ({ snapshot, place }) {
  return new Promise ((resolve, reject) => {

    if (!snapshot.image) {
      return reject({
        message: 'snapshot.image is undefined',
        snapshot
      });
    }

    // Create buffer
    let imageBuffer = new Buffer.from(snapshot.image, 'base64');

    if (isWebp(imageBuffer)) {
      // Convert
      console.log('todo: convert to webp');
    }

    let jpgHandler = uploadSingleImage({ place, snapshot, imageBuffer, fileType: 'jpg' });

    Promise.all([jpgHandler]).then(success => {
      resolve(success);
    }, error => {
      reject(err);
    });
    
  });
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
    new AWS.S3({
      params: {
        Bucket: config.aws.s3BucketName,
        Key: getRelativePathForImage({ place, snapshot, fileType })
      }
    }).upload({
      Body: imageBuffer
    }).send(function (err, data) {
      if (err) {
        reject(err);
      }
      else {
        resolve(data);
      }
    });
  });
}