# Design: latest snapshot record

Status: built, 2026-11-06. See the rollout section for what is live.

## Summary

Each upload stores a small "latest" record for the place in R2 (Cloudflare file storage). The place page reads this record on the server and puts the data in the HTML, so the first view needs no MongoDB connection and no extra API request.

The record is correct because of three choices:

1. **Only uploads write the record.** Page views never do.
2. **An upload deletes the record before it changes `lastSnapshot` in MongoDB.** If a later step fails, the record is missing, not old, and a missing record means "read MongoDB".
3. **A record older than 90 minutes is not trusted.** The page reads MongoDB instead, which limits the damage from a failure nobody planned for.

The estimate was that the wait for place data would drop from about 800 ms to under 100 ms. Measured result: a place page with a usable record now answers in about 180-200 ms, including the HTML and the data, and the photo can start loading with the HTML. See the timings in [SPEC.md](../SPEC.md).

This follows rules F1 to F5 in [SPEC.md](../SPEC.md).

## Why R2

| Option | Fresh right after an upload? | Verdict |
|---|---|---|
| **R2** | Yes. Reads through a Worker binding are strongly consistent everywhere | **Chosen.** Already in our stack |
| Workers KV | No. Changes can take 60 seconds or more to reach other locations | Breaks F1 |
| ISR or a TTL cache | No | Breaks F3 |
| Durable Object | Yes | Works, but is more code, and we only need one small record per place |
| Hyperdrive (connection pooling) | Not relevant | Docs list only Postgres and MySQL |

Sources: Cloudflare docs on [R2 consistency](https://developers.cloudflare.com/r2/reference/consistency/) and [KV](https://developers.cloudflare.com/kv/concepts/how-kv-works/). The R2 guarantee does not apply to a cached custom domain, so the bucket stays private and is only read through the binding.

Read speed is not measured directly yet. Cached place pages come from R2 today and return in 40-70 ms, which suggests it is fast enough. Step 1 of the rollout measures it.

## The record

- **Bucket:** a new private bucket, `vaerhona-latest`, kept apart from the Next.js cache so clearing one does not touch the other.
- **Binding:** `LATEST_R2_BUCKET` in `web/wrangler.jsonc`.
- **Key:** `v1/<place name>.json`. If the format changes, a new prefix makes old records simple misses.
- **Content:** what the place page needs, in the same shape as today's `PLACE` query.

```json
{
  "cuid": "...",
  "name": "veggli",
  "firstSnapshot": { "cuid": "...", "date": "...", "temperature": 0, "humidity": 0, "pressure": 0, "image": "...", "yrWeather": null },
  "lastSnapshot": { "cuid": "...", "date": "...", "temperature": 0, "humidity": 0, "pressure": 0, "image": "...", "yrWeather": null }
}
```

## Write path

Both upload mutations (`snapshots.add` and the older `addSnapshot`) use one shared helper. These are the only two places in the code that write `lastSnapshot`.

```js
// After the snapshot and its photo are stored:
async function publishLatest({ place, snapshot }) {
  await latestStore.remove(place.name); // If this throws, stop
  await place.updateOne({ lastSnapshot: snapshot._id }).exec();

  try {
    await latestStore.put(place.name, buildRecord(place, snapshot));
  } catch (err) {
    console.error('Latest record write failed', err); // Pages fall back to MongoDB
  }
}
```

R2 allows one write per second to the same key, and the docs do not say whether a delete counts. The delete and the write are often closer together than that, so each tries up to 3 times, 1.1 seconds apart. The logs show how many tries the write took, which step 3 of the rollout checks.

### What happens when a step fails

| Failure | Record | `lastSnapshot` | What a visitor sees |
|---|---|---|---|
| Delete fails | Old | Old | The previous snapshot, from both sources. The new one is not published |
| MongoDB update fails | Missing | Old | The previous snapshot, from MongoDB |
| Write of the new record fails | Missing | New | The new snapshot, from MongoDB (slower) |
| Worker dies between steps | Missing | Old or new | Correct, from MongoDB |
| R2 is down during an upload | Old, if the delete failed | Old | The previous snapshot until the next upload |

In the first two rows and the last row, the upload reports `success: false`. Boxes do not check that field, so they do not retry, and the snapshot is published by the next upload about an hour later. The new snapshot still appears in the browsing list, as it does today when a later step fails.

## Read path

The place page moves from `getStaticProps` to `getServerSideProps`, and the data arrives as a page prop.

```js
export async function getServerSideProps({ params }) {
  const place = await getPlaceForPage(params.placeName);
  return place ? { props: { place } } : { notFound: true };
}
```

`getPlaceForPage` does this:

1. Read the record from R2, waiting at most 500 ms.
2. If the record is usable, return it.
3. Otherwise read MongoDB as today, and return that. **Never write it back to R2.**

A record is usable when it exists, parses, and its `lastSnapshot.date` is less than 90 minutes old.

### Why page views never write the record

If they did, this could happen: a page view reads the old snapshot from MongoDB, an upload finishes and writes its new record, and then the page view writes the old data over it. That page would stay wrong until the next upload, with no sign of a problem. Writing only from uploads removes this whole class of bug.

The cost is that a place has no record until its next upload. That is fine, since it just reads MongoDB until then.

### Why `getServerSideProps`

- The photo and values are in the HTML, with no spinner. The photo can use `priority` and start loading right away.
- The responses are not cached, and each client-side navigation asks the server again, so returning to a place shows its latest snapshot.
- It adds a small Worker render to each page view, where static HTML is served today.
- The server now renders dates, so it needs the same text as the browser. `moment` did not load its Norwegian locale on the Worker, so this builds on replacing it with `Intl`.
- "Time ago" is only rendered in the browser, because it depends on the current time and would otherwise differ from the server's text.

Unknown place names return a 404 instead of an empty page.

### Other things that stay the same

- **Browsing:** the arrows, date picker and compare still use `PLACE_SNAPSHOTS` and MongoDB. The first of those requests still runs when the page opens, but it no longer delays the first photo.
- **Front page:** it stays on MongoDB for now, which is correct but slow.
- **GraphQL API:** it keeps the `place` query.

## Accepted downsides

- **Offline boxes stay slow.** A place with no upload in 90 minutes, such as `tornes` today, reads MongoDB on every view. The HTML then takes about 800 ms with no spinner, where today a spinner shows while the data loads. The total wait is about the same.
- **Two uploads at once for one place** could leave the older one as the latest. The record and MongoDB can also disagree, if the uploads finish their steps in a different order. The 90 minute limit does not catch this, but the next upload corrects it. It needs two uploads within a very short time, so we accept it for now. MongoDB alone has a similar risk today.
- **Manual database edits** to `lastSnapshot`, `firstSnapshot` or a place name are not seen by the record. After such an edit, delete the record for that place. The 90 minute limit is the backstop for `lastSnapshot`.
- **Local development against production MongoDB** writes to a local R2, not the real one. Do not upload to production data from a dev server.

## Rollout

The order matters. If a reader runs while any Worker version can upload without touching the record, pages can show old data.

1. **Create the bucket** (one manual step):

   ```bash
   npx wrangler r2 bucket create vaerhona-latest
   ```

2. **PR 1: writer only.** Uploads maintain the record, and no page reads it. Merging deploys it, because every push to `main` that changes `web/` deploys.
3. **Check after two upload cycles.** Compare each record with the API, look for write failures in the logs, and measure R2 read time. Uploads are hourly, and a bad record or a slow read only sends the page back to MongoDB, so a longer wait would only add more samples of the same thing.
4. **PR 2: reader.** Move the page to `getServerSideProps`, and add `priority` to the first photo.
5. **Test and measure.** Run the freshness check in the spec, then compare with the baseline.

**Rolling back:** reverting PR 2 is always safe. Never remove the writer while the reader is live. If a version without the writer ever ran after PR 1, clear the bucket or change the key prefix before the reader goes live again.

## Tests

Unit tests in `web/` with vitest, using fake storage. `pnpm test:run` already runs in the deploy workflow, so a failure blocks the deploy.

- **Failure at each write step:** after each failure in the table above, the read path returns the same snapshot as MongoDB, or the previous one if nothing was published.
- **Order:** the delete happens before the MongoDB update, and the write happens after it.
- **Both mutations** use `publishLatest`.
- **Read fallbacks:** missing, broken, slow and over 90 minute old records all lead to MongoDB.
- **Read path never writes** to the store.

Manual checks before PR 2 is done:

- The spec's freshness check, including from a second location.
- Moving between the front page and a place, using the browser's back button too. The back button may restore a saved copy of the page, which then needs a reload on `pageshow`.
- No React hydration errors. The page will now render real content on the server, and the time-ago text and date input depend on the current time.

## Not part of this work

- An open page updating by itself (spec open question 1). A small endpoint that reads this record would make that cheap to add, with no MongoDB connection per check.
- Using the record for the front page.
- Other performance fixes: image caching, the index and query clean-up, Worker placement, and removing `moment-timezone`.
