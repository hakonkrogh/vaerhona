import fs from 'fs';
import util from 'util';
import cuid from 'cuid';
import childProcess from 'child_process';
import imageSize from 'image-size';

function puts (error, stdout, stderr) { util.puts(stdout) }

export const cwebp = {};
export const dwebp = {};

cwebp.toBuffer = ({ buffer }) => {

  let { type } = imageSize(buffer);

  if (type === 'webp') {
    return Promise.resolve(buffer);
  }
  
  const path = './' + cuid();

  return new Promise((resolve, reject) => {
    fs.writeFile(path, buffer, (error) => {
      
      if (error) {
        return reject(error);
      }

      childProcess.exec(`cwebp ${path} -o ${path}.webp`, (error) => {
        
        if (error) {
          return reject(error);
        }

        fs.readFile(`${path}.webp`, 'utf8', (error, image) => {

          if (error) {
            return reject(error);
          }

          resolve(new Buffer.from(image));

          // Cleanup
          fs.unlink(path);
          fs.unlink(path + '.webp');

        });
      });
    });
  });
}

dwebp.toBuffer = ({ buffer }) => {
  
  const path = './' + cuid();

  let { width, height, type } = imageSize(buffer);

  if (type !== 'webp') {
    return Promise.resolve(buffer);
  }

  return new Promise((resolve, reject) => {
    fs.writeFile(path, buffer, (error) => {
      
      if (error) {
        return reject(error);
      }

      width /= 3;
      height /= 3;

      childProcess.exec(`dwebp ${path} -o ${path}.png -scale ${width} ${height}`, (error) => {
        
        if (error) {
          return reject(error);
        }

        fs.readFile(`${path}.png`, 'utf8', (error, image) => {

          if (error) {
            return reject(error);
          }

          resolve(new Buffer.from(image));

          // Cleanup
          //fs.unlink(path);
          //fs.unlink(path + '.png');
          
        });
      });
    });
  });
}