import AWS from 'aws-sdk';
import config from '../config';
import { getRelativePathForImage } from '../../shared/aws/s3';
import imageSize from 'image-size';

AWS.config.loadFromPath('../__config/vaerhona/aws.config.json');

const s3 = new AWS.S3();

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

  // Compose metadata
  const { width, height, type } = imageSize(imageBuffer);
  const Metadata = {
    width: width.toString(),
    height: height.toString(),
    type
  };

  return new Promise((resolve, reject) => {
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
  });
}

/**
 * Get a image
 * @param snapshot
 * @param place
 * @returns promise
 */
export function getImage ({ placeName, snapshot }) {
  return new Promise((resolve, reject) => {
    s3.getObject({
      Bucket: config.aws.s3BucketName,
      Key: getRelativePathForImage({ placeName, snapshot })
    }, function (err, data) {
      if (err) {
        reject(err);
      }
      else {
        resolve(data);
      }
    });
    /*s3.getObject({
      Bucket: 'vaerhona',
      Key: 'veggli/2016/11/civeyo3b500wo26pahs3bs70q.jpg'
    }, function (err, data) {
      if (err) {
        reject(err);
      }
      else {
        resolve(data);
      }
    });*/
  });
}
