const fs = require('fs-extra');
const ProgressBar = require('progress');

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
    const snapshot = snapshotCache.find(s => s.cuid === id);
    if (!webp && snapshot && snapshot.notWebPImage) {
        return snapshot.notWebPImage;
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
            if (!snapshot.notWebPImage) {
                try {
                    snapshot.notWebPImage = await getSnapshotImage({ id: snapshot.cuid, webp: false });
                    cached++;
                    bar.tick();
                } catch (error) {
                    console.error(error);
                }
            }
        } else {
            snapshot.notWebPImage = null;
        }
    }
    return cached;
}

async function populateInitialCache () {
    try {
        const places = await placeService.getPlaces();
        const bar = new ProgressBar('Populating cache for snapshots :bar', { total: places.length });
        snapshotCache.length = 0;
        for (place of places) {
            const snapshots = await getSnapshotsFromServer({ placeName: place.name, limit: 100 });
            for (snapshot of snapshots) {
                snapshotCache.push(snapshot);
            }
            bar.tick();
        }
        const images = await cacheLatestNotWebpImages();
        console.log(`Cache for snapshots done. Cached ${snapshotCache.length} snapshots and ${images} not webp images`);
    } catch (error) {
        console.error(error);
    }
    return snapshotCache;
}

module.exports = {
    getSnapshots,
    getLastSnapshot,
    getSnapshotImage,
    populateInitialCache
};
