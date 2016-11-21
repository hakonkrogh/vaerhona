import fs from 'fs';
import { cwebp, dwebp } from '../server/core/webp';

function jpgToWebP () {
  fs.readFile('../static/images/snapshot/dummy.jpg', (err, buffer) => {
     cwebp.toBuffer({ buffer })
      .then(newBuffer => {
        console.log('SUCCESS jpgToWebP');
      })
      .catch((err) => {
        console.log('ERROR jpgToWebP');
      });
  });
}

function webpToJpg () {
  fs.readFile('../static/images/snapshot/dummy.webp', (err, buffer) => {
    dwebp.toBuffer({ buffer })
      .then(newBuffer => {
        console.log('SUCCESS webpToJpg');
      })
      .catch((err) => {
        console.log('ERROR webpToJpg');
      });
  });
}

webpToJpg();
jpgToWebP();