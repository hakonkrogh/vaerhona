const config = require('../config');

let frontpageCache;

async function getFrontpage () {
    if (!frontpageCache) {   
        const response = await fetch(`${config.apiUri}/frontpage`);
        frontpageCache = await response.json();
    }
    return frontpageCache;
}

module.exports = {
    getFrontpage
};
