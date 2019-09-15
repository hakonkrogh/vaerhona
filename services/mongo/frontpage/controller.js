import PlaceController from '../model/snapshot-place/controller';
import SnapshotController from '../model/snapshot/controller';

export const getFrontpage = (req, res) => {
  const returnObj = { places: [] };

  PlaceController.facade.Schema.find({
    isPublic: true
  })
    .limit(10)
    .exec()
    .then(places => {
      let snaphotsGetter = [];

      // Get the latest snapshot for each place
      places.forEach(place => {
        snaphotsGetter.push(
          SnapshotController.getLatestSnapshotForPlace(place).then(snapshot => {
            if (snapshot) {
              returnObj.places.push({
                place,
                snapshot
              });
            }
          })
        );
      });

      return Promise.all(snaphotsGetter).then(
        () => {
          // Sort places by last snapshot added
          returnObj.places = returnObj.places.sort(
            (a, b) => b.snapshot.dateAdded - a.snapshot.dateAdded
          );

          res.json(returnObj);
        },
        error => {
          res.status(500).json(Object.assign(returnObj, { error }));
        }
      );
    })
    .catch(error => {
      res.status(500).json(Object.assign(returnObj, { error }));
    });
};
