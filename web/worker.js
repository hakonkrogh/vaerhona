import openNextWorker from './.open-next/worker.js';
import { isCacheableImageRequest, serveCachedImage } from './image-cache.js';

// Durable Objects must be exported from the entry file.
export {
  BucketCachePurge,
  DOQueueHandler,
  DOShardedTagCache,
} from './.open-next/worker.js';

export default {
  fetch(request, env, ctx) {
    if (isCacheableImageRequest(request)) {
      return serveCachedImage({
        request,
        ctx,
        cache: caches.default,
        getImage: () => openNextWorker.fetch(request, env, ctx),
      });
    }

    return openNextWorker.fetch(request, env, ctx);
  },
};
