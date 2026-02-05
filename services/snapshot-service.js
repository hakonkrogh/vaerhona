import generateCuid from 'cuid';

import './init';
import { snapshotModel, snapshotPlaceModel } from './mongo/models';
import { normalizeAndEnrichSnapshot } from './utils';
import { saveImageFromSnapshot } from './aws/s3';
import { hasYrSupport, fetchWeatherData } from './yr-service';

// Temperature validation constants
const TEMP_MIN = -50;
const TEMP_MAX = 50;

/**
 * Check if temperature is within valid range
 * @param {number} temperature
 * @returns {boolean}
 */
function isTemperatureValid(temperature) {
  return temperature >= TEMP_MIN && temperature <= TEMP_MAX;
}

function byDateAscending(a, b) {
  return new Date(a.dateAdded) - new Date(b.dateAdded);
}

export async function getSnapshots({ limit = 10, place, from, to }) {
  const whereFilter = { placeCuid: place.cuid };
  if (from) {
    whereFilter.dateAdded = {
      $gte: from,
    };
    if (to) {
      whereFilter.dateAdded.$lte = to;
    }
  } else if (to) {
    whereFilter.dateAdded = {
      $lte: to,
    };
  }

  const inst = snapshotModel.find(whereFilter);

  if (!to || !from) {
    inst.limit(limit);
  }

  if (to && !from) {
    inst.sort('-dateAdded');
  }

  const snapshots = await inst.exec();

  return snapshots
    .map((snapshot) =>
      normalizeAndEnrichSnapshot({
        snapshot,
        place,
      })
    )
    .sort(byDateAscending);
}

export async function addSnapshot({ boxId, image, ...snapshotBody }) {
  const boxIdTrimmed = boxId.trim().replace(/\/n/g, '');

  // Get place
  let place;

  try {
    place = await snapshotPlaceModel
      .findOne({
        boxId: boxIdTrimmed,
      })
      .exec();
  } catch (err) {
    console.log(err);
  }

  // Fallback to test place if box is not paired
  let isTestPlace = false;
  if (!place) {
    place = await snapshotPlaceModel
      .findOne({
        name: 'test',
      })
      .exec();
    isTestPlace = true;
  }

  console.log('addSnapshot', { boxIdTrimmed, isTestPlace, place: place?._id });

  if (!place) {
    throw new Error('Place 404');
  }

  // Fetch yr.no weather data if place has coordinates
  let yrWeather = null;
  if (hasYrSupport(place)) {
    yrWeather = await fetchWeatherData(place);
    if (!yrWeather) {
      console.warn(`[addSnapshot] Failed to fetch yr.no weather data for place: ${place.name}`);
    }
  }

  // Temperature validation and yr.no fallback
  let temperature = snapshotBody.temperature;
  const sensorTemperature = temperature;

  if (!isTemperatureValid(temperature)) {
    console.log(
      `[addSnapshot] Temperature ${temperature}°C outside valid range [${TEMP_MIN}, ${TEMP_MAX}] for place: ${place.name}`
    );

    if (yrWeather?.airTemperature != null) {
      console.log(
        `[addSnapshot] Using yr.no temperature ${yrWeather.airTemperature}°C instead of sensor value ${sensorTemperature}°C`
      );
      temperature = yrWeather.airTemperature;
    } else if (hasYrSupport(place)) {
      console.warn(
        `[addSnapshot] yr.no fallback failed, using original sensor temperature ${sensorTemperature}°C`
      );
    } else {
      console.log(
        `[addSnapshot] No yr.no support for place ${place.name}, using sensor temperature ${sensorTemperature}°C`
      );
    }
  }

  // Add snapshot
  const snapshot = new snapshotModel({
    place: place._id,
    placeCuid: place.cuid,
    cuid: generateCuid(),
    dateAdded: Date.now(),
    ...snapshotBody,
    temperature: temperature.toFixed(2),
    humidity: snapshotBody.humidity.toFixed(2),
    ...(isTestPlace && { boxId }),
    ...(yrWeather && { yrWeather }),
  });

  const saveResponse = await snapshot.save();

  // Save image
  if (image) {
    await saveImageFromSnapshot({ place, snapshot, image });
  }

  // Update the place with the last snapshot
  await place
    .updateOne({
      lastSnapshot: saveResponse._id,
    })
    .exec();

  return saveResponse;
}

export async function addSnapshotLegacy({
  placeCuid,
  imageBase64,
  ...snapshotBody
}) {
  // Get place
  let place = await snapshotPlaceModel
    .findOne({
      cuid: placeCuid,
    })
    .exec();

  // Fallback to test place if box is not paired
  if (!place) {
    place = await snapshotPlaceModel
      .findOne({
        name: 'test',
      })
      .exec();
  }

  console.log('add snapshot legacy');
  console.log({ placeCuid, snapshotBody });

  // Add snapshot
  const snapshot = new snapshotModel({
    placeCuid,
    cuid: generateCuid(),
    dateAdded: Date.now(),
    ...snapshotBody,
  });

  const saveResponse = await snapshot.save();

  // Save image
  if (imageBase64) {
    await saveImageFromSnapshot({ place, snapshot, image: imageBase64 });
  }

  // Update the place with the last snapshot
  await place
    .updateOne({
      lastSnapshot: saveResponse._id,
    })
    .exec();

  return saveResponse;
}
