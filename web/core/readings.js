// Which sensor readings are off, and how to repair the ones that can be
// repaired. Boxes have stored values that are not real. These rules are used
// when values are shown, and the stored values stay as they are (rule P11 in
// SPEC.md).

// A real temperature is in this range. An upload outside it gets the yr.no
// temperature when there is one (rule B5).
export const TEMPERATURE_MIN = -50;
export const TEMPERATURE_MAX = 50;

// A box can give a temperature below zero in a wrong form: -0.1 °C comes as
// -3276.7 °C and -11 °C as -3265.8 °C. Veggli has 410 of these, most from the
// winter of 2025. The numbers fit a sensor that sends the value as a 16 bit
// two's complement number, read by code that expects a sign bit and a size.
// The stored value is then -3276.8 minus the real one (32768 tenths).
const WRONG_FORM_BASE = -3276.8;

// A broken humidity sensor gives 1 % for weeks. The air at a place is never
// that dry.
const HUMIDITY_STUCK = 1;
const HUMIDITY_MAX = 100;

export function isTemperatureInRange(temperature) {
  return temperature >= TEMPERATURE_MIN && temperature <= TEMPERATURE_MAX;
}

/**
 * The real temperature behind one that came in the wrong form, or null if the
 * value is not of that form.
 *
 * @param {number|null} temperature as stored
 */
export function repairTemperature(temperature) {
  if (temperature == null || isTemperatureInRange(temperature)) {
    return null;
  }

  const repaired = Math.round((WRONG_FORM_BASE - temperature) * 10) / 10;

  // Only temperatures below zero come in the wrong form.
  return repaired < 0 && repaired >= TEMPERATURE_MIN ? repaired : null;
}

// A box that cannot read its sensor uploads 0 for both values (see
// device/sensors.js). Real air never has 0 % humidity, so this does not
// remove a real 0 °C.
function hasNoReading(temperature, humidity) {
  return temperature === 0 && humidity === 0;
}

/**
 * The temperature of a snapshot: the stored one, the repaired one if it came
 * in the wrong form, or null if the reading is off.
 *
 * @param {number|null} temperature
 * @param {number|null} humidity the sensor humidity of the same snapshot
 */
export function validTemperature(temperature, humidity) {
  if (temperature == null || hasNoReading(temperature, humidity)) {
    return null;
  }

  return isTemperatureInRange(temperature)
    ? temperature
    : repairTemperature(temperature);
}

/**
 * The sensor humidity of a snapshot, or null if the reading is off.
 *
 * @param {number|null} temperature the temperature of the same snapshot
 * @param {number|null} humidity
 */
export function validHumidity(temperature, humidity) {
  if (
    humidity == null ||
    hasNoReading(temperature, humidity) ||
    humidity <= HUMIDITY_STUCK ||
    humidity > HUMIDITY_MAX
  ) {
    return null;
  }

  return humidity;
}
