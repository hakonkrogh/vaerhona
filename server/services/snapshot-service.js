const fs = require('fs-extra');
const ProgressBar = require('progress');
const ora = require('ora');

const config = require('../config');
const placeService = require('./place-service');

const snapshotCache = [];
const snapshotImageCache = new Map();

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
    const snapshot = snapshotCache.find(s => s.cuid === id);
    const cachedNotWebpImage = snapshotImageCache.get(snapshot);
    if (!webp && cachedNotWebpImage) {
        return cachedNotWebpImage;
    }

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

async function cacheLatestNotWebpImages () {
    const toCache = 10;
    const bar = new ProgressBar('Caching latest not webp images :bar', { total: toCache });
    let cached = 0;
    const len = snapshotCache.length;
    for (let i = len - 1; i > 0; i--) {
        const snapshot = snapshotCache[i];
        if (len - i < (toCache + 1)) {
            if (!snapshotImageCache.get(snapshot)) {
                try {
                    const image = await getSnapshotImage({ id: snapshot.cuid, webp: false });
                    snapshotImageCache.set(snapshot, image);
                    cached++;
                    bar.tick();
                } catch (error) {
                    console.error(error);
                }
            }
        } else {
            snapshotImageCache.delete(snapshot);
        }
    }
    return cached;
}

async function rebuildCache ({ limit = 100 } = {}) {
    const spinner = ora('Populating cache for snapshots');
    let imagesCached;
    try {
        const places = await placeService.getPlaces();
        snapshotCache.length = 0;
        for (place of places) {
            const snapshots = await getSnapshotsFromServer({ placeName: place.name });
            for (snapshot of snapshots) {
                snapshotCache.push(snapshot);
            }
        }
        spinner.succeed();
        imagesCached = await cacheLatestNotWebpImages();
    } catch (error) {
        spinner.fail(error.message || 'Failed to fetch snapshots');
        console.error(error);
    }

    return { imagesCached };
}

async function populateInitialCache () {
    try {
        const { imagesCached } = await rebuildCache();
        console.log(`Cache for snapshots done. Cached ${snapshotCache.length} snapshots and ${imagesCached} not webp images`);
    } catch (error) {
        console.error(error);
    }
    return snapshotCache;
}

setInterval(rebuildCache, 60 * 1000);

module.exports = {
    getSnapshots,
    getLastSnapshot,
    getSnapshotImage,
    populateInitialCache
};
