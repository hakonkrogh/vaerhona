const ora = require("ora");
const config = require("../config");

const placeCache = [];

async function getPlace({ placeName, placeCuid }) {
  const cachedPlace = placeCache.find(
    p => (placeName ? p.name === placeName : p.cuid === placeCuid)
  );
  if (cachedPlace) {
    return cachedPlace;
  }

  let place;
  try {
    const response = await fetch(`${config.apiUri}/place/${placeName}`);
    place = await response.json();

    if (place) {
      placeCache.push(place);
    }
  } catch (e) {
    console.error(e);
  }

  return place;
}

async function getPlaces() {
  return placeCache;
}

async function rebuildCache() {
  try {
    const spinner = ora("Populating cache for place");
    const response = await fetch(`${config.apiUri}/place`);
    const places = await response.json();
    placeCache.length = 0;
    places.forEach(p => placeCache.push(p));
    spinner.succeed();
  } catch (error) {
    spinner.fail(error);
  }
}

async function populateInitialCache() {
  try {
    await rebuildCache();
  } catch (error) {
    console.error(error);
  }
  return placeCache;
}

setInterval(rebuildCache, 60 * 1000);

module.exports = {
  getPlace,
  getPlaces,
  populateInitialCache
};
