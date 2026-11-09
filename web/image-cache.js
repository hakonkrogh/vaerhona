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

export async function serveCachedImage({ request, ctx, cache, getImage }) {
  const key = getCacheKey(request);
  // The cache is only an optimization. A problem with it must not stop the
  // photo from loading.
  const cached = await cache.match(key).catch((err) => {
    console.error('[image-cache] match failed', err);
    return undefined;
  });

  if (cached) {
    const hit = new Response(cached.body, cached);
    hit.headers.set('x-image-cache', 'hit');
    return hit;
  }

  const image = await getImage();

  // Only a real photo is cached. A photo that fails to load must be able to
  // work on the next try.
  if (image.status !== 200) {
    return image;
  }

  const response = new Response(image.body, image);
  response.headers.set('Cache-Control', CACHE_CONTROL);
  response.headers.set('x-image-cache', 'miss');

  ctx.waitUntil(
    cache.put(key, response.clone()).catch((err) => {
      console.error('[image-cache] put failed', err);
    })
  );

  return response;
}
