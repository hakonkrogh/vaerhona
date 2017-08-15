const config = require('../config');

const placeCache = [];

async function getPlace ({ placeName, placeCuid }) {

    const cachedPlace = placeCache.find(p => placeName ? p.name === placeName : p.cuid === placeCuid);
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

async function getPlaces () {
    return placeCache;
}

async function populateInitialCache () {
    console.log('Starting populating Initial cache for places...');
    try {
        const response = await fetch(`${config.apiUri}/place`);
        const places = await response.json();
        placeCache.length = 0;
        places.forEach(p => placeCache.push(p));
    } catch (error) {
        console.error(error);
    }
    console.log(`Initial cache for places done. Cached ${placeCache.length} places`);
    return placeCache;
}

module.exports = {
    getPlace,
    getPlaces,
    populateInitialCache
};
