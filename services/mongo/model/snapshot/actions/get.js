import S3 from '../../../aws/s3';
import PlaceFacade from '../../snapshot-place/facade';
import facade from '../facade';

const normalizeAndEnrichSnapshot = ({ snapshot, place }) => {
  return {
    cuid: snapshot.cuid,
    placeCuid: snapshot.placeCuid,
    dateAdded: snapshot.dateAdded,
    imagePath: S3.getAbsolutPathForImage({ snapshot, place }),
    temperature: Math.round(snapshot.temperature * 10) / 10,
    humidity: Math.round(snapshot.humidity * 10) / 10,
    pressure: Math.round(snapshot.pressure * 10) / 10
  };
};

function bySnapshotDate(a, b) {
  return new Date(a.dateAdded) - new Date(b.dateAdded);
}

export const getSnapshots = async (req, res) => {
  if (!req.query.placeName) {
    return res.status(433).send('Missing placeName');
  }

  try {
    const place = await PlaceFacade.findOne({ name: req.query.placeName });
    const query = {
      placeCuid: place.cuid
    };

    const { sort } = req.query;
    const { limit = 10, from, to } = req.query;
    let usingBothDates = false;
    if (from && to) {
      usingBothDates = true;
      query.dateAdded = {
        $gte: new Date(from),
        $lt: new Date(to)
      };
    } else if (from) {
      query.dateAdded = {
        $gte: new Date(from)
      };
    } else if (to) {
      query.dateAdded = {
        $lt: new Date(to)
      };
    }

    let q = facade.Schema.find(query);

    if (sort) {
      q = q.sort(sort);
    } else {
      q = q.sort({ dateAdded: -1 });
    }

    if (!usingBothDates && !isNaN(limit)) {
      q = q.limit(parseInt(limit, 10));
    }

    const snapshotsRaw = await q.exec();
    const snapshots = snapshotsRaw
      .map(snapshot => normalizeAndEnrichSnapshot({ snapshot, place }))
      .sort(bySnapshotDate);

    res.json(snapshots);
  } catch (error) {
    res.status(500).json({
      message: 'Error while getting snapshots',
      error
    });
  }
};

export const getImage = async (req, res) => {
  if (!req.params.id) {
    return res.status(422).send('Error: Missing required parameters');
  }

  try {
    const snapshot = await facade.findOne({ cuid: req.params.id });
    const place = await PlaceFacade.findOne({ cuid: snapshot.placeCuid });
    const image = await S3.getImage({ placeName: place.name, snapshot });
    const { type } = image.Metadata;
    const buffer = image.Body;

    res.set({
      'Content-Type': 'image/' + (!type || type === 'jpg' ? 'jpeg' : type),
      'Cache-Control': 'public, max-age=31557600',
      'Content-Length': buffer.length,
      ETag: snapshot.cuid
    });
    res.end(buffer, 'binary');
  } catch (error) {
    res.status(500).send(error);
  }
};

export const getLatestSnapshotForPlace = place => {
  return new Promise((resolve, reject) => {
    if (!place || !place.cuid) {
      return reject('Place is not defined correctly');
    }

    facade.Schema.findOne({ placeCuid: place.cuid })
      .sort('-dateAdded')
      .exec()
      .then(snapshot => {
        resolve(normalizeAndEnrichSnapshot({ snapshot, place }));
      })
      .catch(error => {
        reject({ error });
      });
  });
};
