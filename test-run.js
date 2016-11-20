import fs from 'fs';

import CWebp from 'cwebp';
import AWS from 'aws-sdk';
import imageSize from 'image-size';

import ImageCache from './server/core/ImageCache';
const imageCache = new ImageCache();

import config from './server/config';

AWS.config.loadFromPath('../__config/vaerhona/aws.config.json');

const s3 = new AWS.S3();

const cwebp = CWebp.CWebp;

fs.readFile('./static/images/snapshot/dummy.jpg.base64', 'utf8', (err, image) => {
      
  if (err) {
    return console.log(err);
  }

  if (!image) {
    return console.log('Error: dummy image contents not found');
  }

  let imageBuffer = new Buffer.from(image, 'base64');

  const encoder = new cwebp(imageBuffer);

  encoder.toBuffer((err) => {

    if (err) {
      return reject(err);
    }

    console.log('SUCCESS!');

  });
});


/**
 * Stores a single image buffer to a S3 bucket
 * @param snapshot
 * @param place
 * @param imageBuffer
 * @returns Promise
 */
function uploadSingleImage ({ place, snapshot, imageBuffer }) {

  return new Promise((resolve, reject) => {
  
    let { width, height, type } = imageSize(imageBuffer);

    // Convert buffer to webp
    if (type !== 'webp') {

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
        Key: getRelativePathForImage({ place, snapshot }),
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
