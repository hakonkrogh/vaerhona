export const normalizeAndEnrichSnapshot = ({ snapshot, place }) => {
  return {
    cuid: snapshot.cuid,
    placeName: place.name,
    placeCuid: snapshot.placeCuid,
    dateAdded: snapshot.dateAdded,
    temperature: normalizeCrazyTemperature(snapshot.temperature),
    humidity: Math.round(snapshot.humidity * 10) / 10,
    pressure: Math.round(snapshot.pressure * 10) / 10,
  };
};

const magicNumber = 3274.7; // Used to be 3276.7
export function normalizeCrazyTemperature(temperature) {
  let temp = temperature;
  if (Math.abs(temp) > 100) {
    if (temperature > 0) {
      temp -= magicNumber;
    } else {
      temp += magicNumber;
    }
  }
  return Math.round(temp * 10) / 10;
}
