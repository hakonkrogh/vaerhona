const fs = require('fs-extra');
const config = require('../config');
const placeService = require('./place-service');

const snapshotCache = [];

async function getSnapshots ({ placeName, limit = 100 }) {
    const place = await placeService.getPlace({ placeName });
    return snapshotCache.filter(s => s.placeCuid === place.cuid).slice(0, limit);
}

async function getLastSnapshot ({ placeName }) {
    return await getSnapshots({ placeName, limit: 1 });
}

async function getSnapshotsFromServer ({ placeName, limit = 100 }) {
    const response = await fetch(`${config.apiUri}/snapshot/?placeName=${placeName}&limit=${limit}`);
    return await response.json();
}

async function getSnapshotImage ({ id, webp }) {
    const response = await fetch(`${config.apiUri}/snapshot/${id}/image?webp=${webp}`);
    const buffer = await response.buffer();

    return {
        buffer,
        headers: {
            'Content-type': response.headers.get('content-type'),
            'Cache-control': response.headers.get('cache-control'),
            'Etag': response.headers.get('Etag')
        }
    };
}

async function storeNotWebpSnapshotImage ({ snapshot }) {
    try {
        const response = await fetch(`${config.apiUri}/snapshot/${snapshot.cuid}/image?webp=false`);
        const buffer = await response.buffer();

        const dir = `./static/snapshots`;
        await fs.ensureDir(dir);
        await fs.writeFile(`${dir}/${snapshot.cuid}.jpg`, buffer);
    } catch (error) {
        console.error(error);
    }
}

async function populateInitialCache () {
    console.log('Starting populating Initial cache for snapshots...');
    try {
        snapshotCache.length = 0;
        const places = await placeService.getPlaces();
        for (place of places) {
            const snapshots = await getSnapshotsFromServer({ placeName: place.name, limit: 100 });
            for (snapshot of snapshots) {
                await storeNotWebpSnapshotImage({ snapshot });
                snapshotCache.push(snapshot);
            }
            console.log(`Cached ${snapshots.length} snapshots for ${place.name}`);
        }
    } catch (error) {
        console.error(error);
    }
    console.log(`Initial cache for snapshots done. Cached ${snapshotCache.length} snapshots`);
    return snapshotCache;
}

module.exports = {
    getSnapshots,
    getLastSnapshot,
    getSnapshotImage,
    populateInitialCache
};
