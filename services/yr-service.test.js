import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { hasYrSupport, fetchTemperature } from './yr-service.js';

describe('yr-service', () => {
  // Test place with coordinates
  const placeWithCoords = { name: 'test-place', lat: 60.0283364, lon: 9.025748 };
  // Test place without coordinates
  const placeWithoutCoords = { name: 'no-coords-place' };

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

    it('includes correct coordinates in API request', async () => {
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
      expect(url).toContain(`lat=${placeWithCoords.lat}`);
      expect(url).toContain(`lon=${placeWithCoords.lon}`);
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
