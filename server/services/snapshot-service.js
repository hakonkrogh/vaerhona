const config = require('../config');

const snapshotCache = [];

async function getSnapshots ({ placeName, limit = 100 }) {
    const response = await fetch(`${config.apiUri}/snapshot/?placeName=${placeName}&limit=${limit}`);
    return await response.json();
}

async function getLastSnapshot ({ placeName }) {
    const response = await fetch(`${config.apiUri}/snapshot/?placeName=${placeName}&last=true`);
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

module.exports = {
    getSnapshots,
    getLastSnapshot,
    getSnapshotImage
};
