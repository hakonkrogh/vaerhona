/**
 * Serves a response from the Cloudflare cache, or gets it and stores it there.
 * The cache is only an optimization, so a problem with it must never stop the
 * response.
 *
 * @param {object} options
 * @param {string} options.name shows in logs and in the `x-<name>-cache` header
 * @param {Request} options.key
 * @param {() => Promise<Response>} options.getResponse
 * @param {(response: Response) => Response | null} options.toCacheable the
 * response to store and return, or null to return the response unchanged
 */
export async function serveFromCache({
  name,
  key,
  ctx,
  cache,
  getResponse,
  toCacheable,
}) {
  const cached = await cache.match(key).catch((err) => {
    console.error(`[${name}-cache] match failed`, err);
    return undefined;
  });

  if (cached) {
    const hit = new Response(cached.body, cached);
    hit.headers.set(`x-${name}-cache`, 'hit');
    return hit;
  }

  const response = await getResponse();
  const cacheable = toCacheable(response);

  if (!cacheable) {
    return response;
  }

  cacheable.headers.set(`x-${name}-cache`, 'miss');

  ctx.waitUntil(
    cache.put(key, cacheable.clone()).catch((err) => {
      console.error(`[${name}-cache] put failed`, err);
    })
  );

  return cacheable;
}
