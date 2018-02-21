const fs = require("fs-extra");
const ProgressBar = require("progress");
const ora = require("ora");

const config = require("../config");
const placeService = require("./place-service");

const snapshotCache = [];
const snapshotCacheMaxLength = 1000;

async function getSnapshots({ placeName, limit = 100 }) {
  const place = await placeService.getPlace({ placeName });
  return snapshotCache
    .filter(s => s.placeCuid === place.cuid)
    .slice(limit * -1);
}

async function getLastSnapshot({ placeName }) {
  return await getSnapshots({ placeName, limit: 1 });
}

async function getSnapshotsFromServer({ placeName, limit = 100 }) {
  const response = await fetch(
    `${config.apiUri}/snapshot/?placeName=${placeName}&limit=${limit}`
  );
  return await response.json();
}

async function getSnapshotImage({ id, webp }) {
  const snapshot = snapshotCache.find(s => s.cuid === id);

  const response = await fetch(
    `${config.apiUri}/snapshot/${id}/image?webp=${webp}`
  );
  const buffer = await response.buffer();

  return {
    buffer,
    headers: {
      "Content-type": response.headers.get("content-type"),
      "Cache-control": response.headers.get("cache-control"),
      Etag: response.headers.get("Etag")
    }
  };
}

async function rebuildCache({ limit = 100 } = {}) {
  const spinner = ora("Populating cache for snapshots");
  try {
    const places = await placeService.getPlaces();
    for (place of places) {
      const snapshots = await getSnapshotsFromServer({ placeName: place.name });
      for (snapshot of snapshots) {
        if (!snapshotCache.find(s => s.cuid === snapshot.cuid)) {
          snapshotCache.push(snapshot);
        }
      }
    }

    // Limit the cache to 1000 snapshots
    if (snapshotCache.length > snapshotCacheMaxLength) {
      const toRemove = snapshotCache.length - snapshotCacheMaxLength;
      snapshotCache.splice(0, toRemove);
    }

    spinner.succeed();
  } catch (error) {
    spinner.fail(error.message || "Failed to fetch snapshots");
    console.error(error);
  }
}

async function populateInitialCache() {
  try {
    await rebuildCache();
  } catch (error) {
    console.error(error);
  }
}

setInterval(rebuildCache, 60 * 1000);

module.exports = {
  getSnapshots,
  getLastSnapshot,
  getSnapshotImage,
  populateInitialCache
};
