const config = require('../config');

let frontpageCache;

async function getFrontpage () {
    if (!frontpageCache) {
        await rebuildCache();
    }
    return frontpageCache;
}

async function rebuildCache () {
    try {
        const response = await fetch(`${config.apiUri}/frontpage`);
        frontpageCache = await response.json();
    } catch (error) {
        console.log(error);
    }
}

async function populateInitialCache () {
  return await rebuildCache();
}

setInterval(rebuildCache, 60 * 60 * 1000);

module.exports = {
    getFrontpage,
    populateInitialCache
};
