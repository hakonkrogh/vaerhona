import fs from 'fs';
import imageSize from 'image-size';
import { toBuffer } from './cwebp';

fs.readFile('../static/images/snapshot/dummy.jpg.base64', 'utf8', (err, image) => {
      
  if (err) {
    return console.log(err);
  }

  if (!image) {
    return console.log('Error: dummy image contents not found');
  }

  let buffer = new Buffer.from(image, 'base64');

  let { type } = imageSize(buffer);

  if (type !== 'webp') {
    toBuffer({ buffer })
      .then(newBuffer => {
        console.log('SUCCESS');
        console.log(newBuffer);
      })
      .catch((err) => {
        console.log('ERROR');
        console.log(err);
      });
  }
  else {
    console.log('ALREADY WEPB');
  }

});