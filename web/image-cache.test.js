import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isCacheableImageRequest, serveCachedImage } from './image-cache';

const PHOTO =
  'https://example.test/_next/image?url=https%3A%2F%2Fvaerhona.s3-eu-west-1.amazonaws.com%2Fveggli%2F2026%2F11%2Fabc&w=750&q=75';

function makeCache() {
  const stored = new Map();

  return {
    stored,
    match: vi.fn(async (key) => stored.get(key.url)?.clone()),
    put: vi.fn(async (key, response) => {
      stored.set(key.url, response);
    }),
  };
}

function photoRequest(accept = 'image/webp,*/*') {
  return new Request(PHOTO, { headers: { accept } });
}

describe('isCacheableImageRequest', () => {
  it('accepts an optimized snapshot photo', () => {
    expect(isCacheableImageRequest(new Request(PHOTO))).toBe(true);
  });

  it('skips images with a relative URL', () => {
    const request = new Request(
      'https://example.test/_next/image?url=%2Fstatic%2Fa.png&w=750&q=75'
    );

    expect(isCacheableImageRequest(request)).toBe(false);
  });

  it('skips other paths and methods', () => {
    expect(
      isCacheableImageRequest(new Request('https://example.test/veggli'))
    ).toBe(false);
    expect(isCacheableImageRequest(new Request(PHOTO, { method: 'HEAD' }))).toBe(
      false
    );
  });
});

describe('serveCachedImage', () => {
  let cache;
  let ctx;
  let getImage;

  beforeEach(() => {
    cache = makeCache();
    ctx = { waitUntil: vi.fn() };
    getImage = vi.fn(
      async () =>
        new Response('photo', {
          headers: { 'content-type': 'image/webp', vary: 'Accept' },
        })
    );
  });

  const serve = (request = photoRequest()) =>
    serveCachedImage({ request, ctx, cache, getImage });

  it('adds a long cache lifetime on a miss', async () => {
    const response = await serve();

    expect(response.headers.get('cache-control')).toBe(
      'public, max-age=31536000, immutable'
    );
    expect(response.headers.get('x-image-cache')).toBe('miss');
    expect(response.headers.get('content-type')).toBe('image/webp');
    expect(await response.text()).toBe('photo');
    expect(ctx.waitUntil).toHaveBeenCalledTimes(1);
  });

  it('serves the second request from the cache', async () => {
    await serve();
    const response = await serve();

    expect(getImage).toHaveBeenCalledTimes(1);
    expect(response.headers.get('x-image-cache')).toBe('hit');
    expect(await response.text()).toBe('photo');
  });

  it('keeps browsers with different format support apart', async () => {
    await serve(photoRequest('image/webp,*/*'));
    await serve(photoRequest('image/avif,image/webp,*/*'));
    await serve(photoRequest('*/*'));

    expect(getImage).toHaveBeenCalledTimes(3);
    expect(cache.stored.size).toBe(3);
  });

  it('keeps different sizes apart', async () => {
    await serve();
    await serve(
      new Request(PHOTO.replace('w=750', 'w=1080'), {
        headers: { accept: 'image/webp,*/*' },
      })
    );

    expect(getImage).toHaveBeenCalledTimes(2);
  });

  it('ignores query parameters that do not change the image', async () => {
    await serve();
    await serve(
      new Request(`${PHOTO}&unused=1`, {
        headers: { accept: 'image/webp,*/*' },
      })
    );

    expect(getImage).toHaveBeenCalledTimes(1);
  });

  it('still serves the image when the cache read fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    cache.match.mockRejectedValue(new Error('cache down'));

    const response = await serve();

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('photo');
  });

  it('still serves the image when the cache write fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    cache.put.mockRejectedValue(new Error('cache down'));

    const response = await serve();

    expect(await response.text()).toBe('photo');
    await expect(ctx.waitUntil.mock.calls[0][0]).resolves.toBeUndefined();
  });

  it('does not cache a failed image', async () => {
    getImage.mockResolvedValue(new Response('not found', { status: 404 }));

    const response = await serve();

    expect(response.status).toBe(404);
    expect(response.headers.get('cache-control')).toBeNull();
    expect(cache.put).not.toHaveBeenCalled();
  });
});
