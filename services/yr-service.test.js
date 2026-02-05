import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { hasYrSupport, fetchTemperature, roundCoordinate } from './yr-service.js';

describe('yr-service', () => {
  // Test place with high-precision coordinates (more than 4 decimal places)
  const placeWithCoords = { name: 'test-place', lat: 60.0283364, lon: 9.025748 };
  // Test place without coordinates
  const placeWithoutCoords = { name: 'no-coords-place' };

  describe('roundCoordinate', () => {
    it('rounds to 4 decimal places', () => {
      expect(roundCoordinate(59.123456789)).toBe(59.1235);
      expect(roundCoordinate(10.987654321)).toBe(10.9877);
    });

    it('handles coordinates that need no rounding', () => {
      expect(roundCoordinate(59.1234)).toBe(59.1234);
      expect(roundCoordinate(10.5)).toBe(10.5);
    });

    it('handles negative coordinates', () => {
      expect(roundCoordinate(-59.123456789)).toBe(-59.1235);
      expect(roundCoordinate(-10.987654321)).toBe(-10.9877);
    });

    it('handles zero', () => {
      expect(roundCoordinate(0)).toBe(0);
    });

    it('rounds correctly at the boundary (5)', () => {
      expect(roundCoordinate(59.12345)).toBe(59.1235);
      expect(roundCoordinate(59.123449)).toBe(59.1234);
    });

    it('does not expose more than 4 decimal places for privacy', () => {
      const rounded = roundCoordinate(59.123456789);
      const decimalPlaces = rounded.toString().split('.')[1]?.length || 0;
      expect(decimalPlaces).toBeLessThanOrEqual(4);
    });
  });

  describe('hasYrSupport', () => {
    it('returns true for place with lat and lon', () => {
      expect(hasYrSupport(placeWithCoords)).toBe(true);
    });

    it('returns false for place without coordinates', () => {
      expect(hasYrSupport(placeWithoutCoords)).toBe(false);
    });

    it('returns false for null place', () => {
      expect(hasYrSupport(null)).toBe(false);
    });

    it('returns false for undefined place', () => {
      expect(hasYrSupport(undefined)).toBe(false);
    });

    it('returns false for place with only lat', () => {
      expect(hasYrSupport({ name: 'partial', lat: 60.0 })).toBe(false);
    });

    it('returns false for place with only lon', () => {
      expect(hasYrSupport({ name: 'partial', lon: 9.0 })).toBe(false);
    });

    it('returns false for place with non-numeric coordinates', () => {
      expect(hasYrSupport({ name: 'invalid', lat: '60.0', lon: '9.0' })).toBe(false);
    });
  });

  describe('fetchTemperature', () => {
    const mockFetch = vi.fn();

    beforeEach(() => {
      vi.stubGlobal('fetch', mockFetch);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      mockFetch.mockReset();
    });

    it('returns null for place without coordinates', async () => {
      const result = await fetchTemperature(placeWithoutCoords);
      expect(result).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('fetches temperature from yr.no API for place with coordinates', async () => {
      const mockTemperature = 15.5;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          properties: {
            timeseries: [
              {
                data: {
                  instant: {
                    details: {
                      air_temperature: mockTemperature,
                    },
                  },
                },
              },
            ],
          },
        }),
      });

      const result = await fetchTemperature(placeWithCoords);

      expect(result).toBe(mockTemperature);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('api.met.no/weatherapi/locationforecast'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': expect.stringContaining('vaerhona'),
          }),
        })
      );
    });

    it('rounds coordinates to 4 decimal places in API request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          properties: {
            timeseries: [{ data: { instant: { details: { air_temperature: 10 } } } }],
          },
        }),
      });

      await fetchTemperature(placeWithCoords);

      const url = mockFetch.mock.calls[0][0];
      // placeWithCoords.lat = 60.0283364 should be rounded to 60.0283
      // placeWithCoords.lon = 9.025748 should be rounded to 9.0257
      expect(url).toContain('lat=60.0283');
      expect(url).toContain('lon=9.0257');
      // Ensure we don't send the full precision coordinates
      expect(url).not.toContain('lat=60.0283364');
      expect(url).not.toContain('lon=9.025748');
    });

    it('returns null when API returns non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await fetchTemperature(placeWithCoords);

      expect(result).toBeNull();
    });

    it('returns null when API response has invalid structure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' }),
      });

      const result = await fetchTemperature(placeWithCoords);

      expect(result).toBeNull();
    });

    it('returns null when temperature is not a number', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          properties: {
            timeseries: [
              {
                data: {
                  instant: {
                    details: {
                      air_temperature: 'not a number',
                    },
                  },
                },
              },
            ],
          },
        }),
      });

      const result = await fetchTemperature(placeWithCoords);

      expect(result).toBeNull();
    });

    it('returns null when fetch throws an error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchTemperature(placeWithCoords);

      expect(result).toBeNull();
    });

    it('handles negative temperatures correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          properties: {
            timeseries: [
              {
                data: {
                  instant: {
                    details: {
                      air_temperature: -15.3,
                    },
                  },
                },
              },
            ],
          },
        }),
      });

      const result = await fetchTemperature(placeWithCoords);

      expect(result).toBe(-15.3);
    });

    it('handles zero temperature correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          properties: {
            timeseries: [
              {
                data: {
                  instant: {
                    details: {
                      air_temperature: 0,
                    },
                  },
                },
              },
            ],
          },
        }),
      });

      const result = await fetchTemperature(placeWithCoords);

      expect(result).toBe(0);
    });
  });
});
