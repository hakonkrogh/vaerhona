import fs from 'fs';
import { cwebp, dwebp } from './webp';

function jpgToWebP () {
  fs.readFile('../static/images/snapshot/dummy.jpg.base64', 'utf8', (err, image) => {
        
    if (err) {
      return console.log(err);
    }

    if (!image) {
      return console.log('Error: dummy image contents not found');
    }

    let buffer = new Buffer.from(image, 'base64');

    cwebp.toBuffer({ buffer })
      .then(newBuffer => {
        console.log('SUCCESS');
        console.log(newBuffer);
      })
      .catch((err) => {
        console.log('ERROR');
        console.log(err);
      });

  });
}

function webpToJpg () {
  fs.readFile('../static/images/snapshot/dummy.webp', (err, buffer) => {
        
    if (err) {
      return console.log(err);
    }

    if (!buffer) {
      return console.log('Error: dummy image contents not found');
    }

    dwebp.toBuffer({ buffer })
      .then(newBuffer => {
        console.log('SUCCESS');
        console.log(newBuffer);
      })
      .catch((err) => {
        console.log('ERROR');
        console.log(err);
      });

  });
}

webpToJpg();
jpgToWebP();