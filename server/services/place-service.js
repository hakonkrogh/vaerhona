const config = require('../config');

const placeCache = [];

async function getPlace ({ placeName }) {

    const cachedPlace = placeCache.find(p => p.name === placeName);
    if (cachedPlace) {
        return cachedPlace;
    }

    const response = await fetch(`${config.apiUri}/place/${placeName}`);
    const place = await response.json();
    
    if (place) {
        placeCache.push(place);
    }

    return place;
}

async function getAllPlaces () {
    const response = await fetch(`${config.apiUri}/place`);
    return await response.json();
}

async function populateInitialCache () {
    const places = await getAllPlaces();
    placeCache.length = 0;
    places.forEach(p => placeCache.push(p));
}

setTimeout(populateInitialCache, 10000);

module.exports = {
    getPlace
};
