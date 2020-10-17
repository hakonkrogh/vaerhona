export const normalizeAndEnrichSnapshot = ({ snapshot, place }) => {
  return {
    cuid: snapshot.cuid,
    placeName: place.name,
    placeCuid: snapshot.placeCuid,
    dateAdded: snapshot.dateAdded,
    temperature: Math.round(snapshot.temperature * 10) / 10,
    humidity: Math.round(snapshot.humidity * 10) / 10,
    pressure: Math.round(snapshot.pressure * 10) / 10,
  };
};
