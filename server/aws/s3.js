import AWS from 'aws-sdk';
import config from '../config';
import { getRelativePathForImage } from '../../shared/aws/s3';

if (process.env.NODE_ENV === 'production') {
  AWS.config.loadFromPath('aws.config.production.json');
}
else {
  AWS.config.loadFromPath('aws.config.development.json');
}

/**
 * Stores a base64 image string to a S3 bucket
 * @param image
 * @param key
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
    
    // Upload
    let s3obj = new AWS.S3({
      params: {
        Bucket: config.aws.s3BucketName,
        Key: getRelativePathForImage({ place, snapshot })
      }
    }).upload({ Body: imageBuffer })
    //.on('httpUploadProgress', function(evt) { console.log(evt); })
    .send(function (err, data) {
      if (err) {
        reject(err);
      }
      else {
        resolve(data);
      }
    });
  });
}