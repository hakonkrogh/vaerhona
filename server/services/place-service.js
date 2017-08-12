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

module.exports = {
    getPlace
};
