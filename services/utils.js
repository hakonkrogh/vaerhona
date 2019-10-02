import { getAbsolutPathForImage } from './aws/s3';

export const normalizeAndEnrichSnapshot = ({ snapshot, place }) => {
  return {
    cuid: snapshot.cuid,
    placeName: place.name,
    placeCuid: snapshot.placeCuid,
    dateAdded: snapshot.dateAdded,
    imagePath: getAbsolutPathForImage({ snapshot, place }),
    temperature: Math.round(snapshot.temperature * 10) / 10,
    humidity: Math.round(snapshot.humidity * 10) / 10,
    pressure: Math.round(snapshot.pressure * 10) / 10
  };
};
