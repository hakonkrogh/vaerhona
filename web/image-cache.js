import { serveFromCache } from './edge-cache.js';

// A snapshot photo never changes, and a new snapshot gets a new URL, so an
// optimized photo can be cached forever without hiding a newer one.
const CACHE_CONTROL = 'public, max-age=31536000, immutable';

const OPTIMIZED_IMAGE_PATH = '/_next/image';

/**
 * Snapshot photos have absolute URLs, and next.config.js only allows our
 * snapshot storage. Other images, with relative URLs, can change between
 * deploys, so they are left out.
 */
export function isCacheableImageRequest(request) {
  const url = new URL(request.url);

  return (
    request.method === 'GET' &&
    url.pathname === OPTIMIZED_IMAGE_PATH &&
    /^https:\/\//.test(url.searchParams.get('url') ?? '')
  );
}

/**
 * Only what changes the image is in the key. The image format depends on what
 * the browser accepts, and the Cache API does not vary on the Accept header.
 */
function getCacheKey(request) {
  const accept = request.headers.get('accept') ?? '';
  const url = new URL(request.url);
  const key = new URL(url.pathname, url.origin);

  for (const name of ['url', 'w', 'q']) {
    key.searchParams.set(name, url.searchParams.get(name) ?? '');
  }
  key.searchParams.set('avif', String(accept.includes('image/avif')));
  key.searchParams.set('webp', String(accept.includes('image/webp')));

  return new Request(key.toString());
}

export function serveCachedImage({ request, ctx, cache, getImage }) {
  return serveFromCache({
    name: 'image',
    key: getCacheKey(request),
    ctx,
    cache,
    getResponse: getImage,
    // Only a real photo is cached. A photo that fails to load must be able to
    // work on the next try.
    toCacheable(image) {
      if (image.status !== 200) {
        return null;
      }

      const response = new Response(image.body, image);
      response.headers.set('Cache-Control', CACHE_CONTROL);
      return response;
    },
  });
}
