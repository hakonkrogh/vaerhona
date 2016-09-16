import cuid from 'cuid';
import Snapshot from './models/snapshot';
import Place from './models/place';
import { addSnapshotRaw } from './controllers/snapshot.controller';
import fs from 'fs';

export default function () {

  Place.count().exec((err, count) => {
    if (count === 0) {
      const places = [
        new Place({ cuid: cuid(), name: 'test' }),
        new Place({ cuid: cuid(), name: 'test2' }),
        new Place({ cuid: cuid(), name: 'test3' })
      ];

      Place.create(places, error => {
        if (!error) {
          console.log(`Successfully added ${places.length} dummy place(s)`);

          addSnapshots({ place: places[0] });
        }
        else {
          console.log(`Failed to add 1 dummy place:`, error);
        }
      });
    }
  });
  
  function addSnapshots ({ place }) {
    Snapshot.count().exec((err, count) => {
      
      if (count > 2) {
        return;
      }

      let snapshotsToAdd = 5;

      fs.readFile('./server/dummy-images/snapshot.jpg.base64', 'utf8', (err, image) => {
        
        if (err) {
          return console.log(err);
        }

        if (!image) {
          return console.log('Error: dummy image contents not found');
        }

        console.log(`Adding ${snapshotsToAdd} dummy snapshots...`);

        const snapshots = [];
      
        // Set standard start values
        let temperature = Math.round(getRandomArbitrary(0, 30) * 10) / 10;
        let humidity = Math.round(getRandomArbitrary(50, 100) * 10) / 10;
        let pressure = Math.round(getRandomArbitrary(850, 1100));
        
        let date = new Date();
        date.setHours(date.getHours() - snapshotsToAdd);

        for (let i = 0; i < snapshotsToAdd; i++) {
          temperature += (Math.round(Math.random() * 10) / 10) * (Math.random() > .5 ? -1 : 1);
          humidity += (Math.round(getRandomArbitrary(0, 2))) * (Math.random() > .5 ? -1 : 1);
          pressure += (Math.round(getRandomArbitrary(0, 2))) * (Math.random() > .5 ? -1 : 1);
          
          date.setHours(date.getHours() + 1);

          snapshots.push(addSnapshotRaw({
            placeCuid: place.cuid,
            image,
            temperature,
            humidity,
            pressure,
            dateAdded: date.getTime()
          }));
        }
        
        Promise.all(snapshots).then(addedSnapshots => {
          console.log(`Successfully added ${addedSnapshots.length} dummy snapshots`);
        }, error => {
          console.log(`Failed to add ${snapshotsToAdd} dummy snapshots:`, error);
        });
      });
    });
  }

  // Returns a random number between min (inclusive) and max (exclusive)
  function getRandomArbitrary (min, max) {
    return Math.random() * (max - min) + min;
  }
}
