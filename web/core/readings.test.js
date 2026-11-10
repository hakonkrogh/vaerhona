import { describe, expect, it } from 'vitest';

import {
  isTemperatureInRange,
  repairTemperature,
  validHumidity,
  validTemperature,
} from './readings';

describe('isTemperatureInRange', () => {
  it('takes -50 to 50 °C', () => {
    expect(isTemperatureInRange(-50)).toBe(true);
    expect(isTemperatureInRange(50)).toBe(true);
    expect(isTemperatureInRange(-50.1)).toBe(false);
    expect(isTemperatureInRange(50.1)).toBe(false);
  });

  it('does not take a missing value', () => {
    expect(isTemperatureInRange(undefined)).toBe(false);
    expect(isTemperatureInRange(NaN)).toBe(false);
  });
});

describe('repairTemperature', () => {
  it('gives the real temperature behind one in the wrong form', () => {
    // As stored for Veggli in the night of 19 January 2025. The readings
    // before and after were 0.6 °C.
    expect(repairTemperature(-3276.6)).toBe(-0.2);
    expect(repairTemperature(-3275.5)).toBe(-1.3);
    expect(repairTemperature(-3273.3)).toBe(-3.5);
    // The lowest and highest values the form can hold.
    expect(repairTemperature(-3276.7)).toBe(-0.1);
    expect(repairTemperature(-3226.8)).toBe(-50);
  });

  it('gives null for a normal temperature', () => {
    expect(repairTemperature(-12.4)).toBeNull();
    expect(repairTemperature(0)).toBeNull();
    expect(repairTemperature(50)).toBeNull();
  });

  it('gives null for an off temperature of another form', () => {
    expect(repairTemperature(3276.7)).toBeNull();
    expect(repairTemperature(85)).toBeNull();
    expect(repairTemperature(-127)).toBeNull();
    // These would be 0 °C and -50.1 °C, which never come in the wrong form.
    expect(repairTemperature(-3276.8)).toBeNull();
    expect(repairTemperature(-3226.7)).toBeNull();
  });

  it('gives null for a missing temperature', () => {
    expect(repairTemperature(null)).toBeNull();
    expect(repairTemperature(undefined)).toBeNull();
  });
});

describe('validTemperature', () => {
  it('keeps a normal reading', () => {
    expect(validTemperature(-12.4, 80)).toBe(-12.4);
    expect(validTemperature(31.7, 25)).toBe(31.7);
  });

  it('repairs a temperature in the wrong form', () => {
    expect(validTemperature(-3276.6, 47)).toBe(-0.2);
    expect(validTemperature(-3265.8, 47)).toBe(-11);
  });

  it('leaves out an off temperature that cannot be repaired', () => {
    expect(validTemperature(3276.7, 47)).toBeNull();
    expect(validTemperature(85, 47)).toBeNull();
  });

  it('leaves out a snapshot where the box had no reading', () => {
    expect(validTemperature(0, 0)).toBeNull();
  });

  it('keeps a real 0 °C', () => {
    expect(validTemperature(0, 93.2)).toBe(0);
    // An old snapshot can lack one of the values.
    expect(validTemperature(0, null)).toBe(0);
  });

  it('keeps the temperature when only the humidity sensor is stuck', () => {
    expect(validTemperature(4.2, 1)).toBe(4.2);
  });

  it('gives null for a missing temperature', () => {
    expect(validTemperature(null, 80)).toBeNull();
    expect(validTemperature(undefined, 80)).toBeNull();
  });
});

describe('validHumidity', () => {
  it('keeps a normal reading', () => {
    expect(validHumidity(4.2, 77.3)).toBe(77.3);
    expect(validHumidity(4.2, 100)).toBe(100);
    expect(validHumidity(4.2, 1.1)).toBe(1.1);
  });

  it('leaves out a stuck sensor', () => {
    expect(validHumidity(4.2, 1)).toBeNull();
    expect(validHumidity(4.2, 0)).toBeNull();
  });

  it('leaves out a snapshot where the box had no reading', () => {
    expect(validHumidity(0, 0)).toBeNull();
  });

  it('leaves out a humidity over 100 %', () => {
    expect(validHumidity(4.2, 100.1)).toBeNull();
  });

  it('keeps the humidity when only the temperature is off', () => {
    expect(validHumidity(-3276.6, 47)).toBe(47);
  });

  it('gives null for a missing humidity', () => {
    expect(validHumidity(4.2, null)).toBeNull();
  });
});
