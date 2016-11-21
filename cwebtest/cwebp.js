import fs from 'fs';
import util from 'util';
import cuid from 'cuid';
import childProcess from 'child_process';

function puts (error, stdout, stderr) { util.puts(stdout) }

export function toBuffer ({ buffer }) {
  
  const path = './' + cuid();

  return new Promise((resolve, reject) => {
    fs.writeFile(path, buffer, (err) => {
      if (err) {
        return reject(err);
      }

      childProcess.exec(`cwebp ${path} -o ${path}.webp`, function (error, stdout, stderr) {
        if (error) {
          return reject(error);
        }

        fs.readFile(`${path}.webp`, 'utf8', (err, image) => {
          if (err) {
            return reject(err);
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