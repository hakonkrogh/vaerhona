const placeService = require('./place-service');
const snapshotService = require('./snapshot-service');

async function populateInitialCache () {
    try {
        await placeService.populateInitialCache();
        await snapshotService.populateInitialCache();
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    populateInitialCache,
    placeService,
    snapshotService
};
