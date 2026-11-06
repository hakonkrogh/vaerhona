export const normalizeAndEnrichSnapshot = ({ snapshot, place }) => {
  return {
    cuid: snapshot.cuid,
    placeName: place.name,
    placeCuid: snapshot.placeCuid,
    dateAdded: snapshot.dateAdded,
    temperature: snapshot.temperature,
    humidity: Math.round(snapshot.humidity * 10) / 10,
    pressure: Math.round(snapshot.pressure * 10) / 10,
    yrWeather: snapshot.yrWeather || null,
  };
};
