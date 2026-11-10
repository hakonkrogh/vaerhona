# Design: snapshot values stored on the client

Status: built, 2026-11-10. Checked in a browser with made-up data. Not yet run against MongoDB or measured on production.

## Summary

The browser keeps a local copy of the sensor values for every place the user has opened. Photos are not stored. Charts, the arrows, the date picker and compare read the local copy first, so they answer without the server.

- **Storage:** IndexedDB, the database built into every browser. One record per place per month.
- **Transport:** a new API, `/api/values`, that returns one month of values in a compact form. A finished month never changes, so the browser and Cloudflare keep it forever, like snapshot lists today.
- **Backfill:** in the background, starting with the month of now and the month on screen, then growing outwards from both until the place's first snapshot.
- **Latest stays on the server.** The local copy never decides what the latest snapshot is. Rules F1 to F6 in [SPEC.md](../SPEC.md) are untouched.

No service worker and no new dependency.

## Why this is safe

A box only adds snapshots dated now (SPEC.md, "What may be cached"). So everything at or before a place's latest snapshot is final. The page already knows the latest snapshot from the server HTML. The local copy only ever holds data up to that point, and it can be thrown away and rebuilt at any time.

## What is stored

Per snapshot: `cuid`, date, temperature, humidity, pressure and the eight yr.no fields. The photo URL is not stored. The browser builds it from the snapshot's date and `cuid`, and from `imageBase` in the API answer, which says where the place's photos are (`fromColumns` in `web/core/snapshot-values.js`).

In a test in Chrome with made-up data and no yr.no fields, 32,020 snapshots (45 months) took about 1 MB of storage. Real data with yr.no fields will take more.

Size as plain JSON, estimated, not measured: about 80 bytes per snapshot. A box uploads about 8,760 times a year, so one year is about 0.7 MB, and 10 years about 7 MB per place. Over the network it is compressed, to roughly a third. This is more than the 1-2 MB I said in the question. The `cuid` (25 characters) is most of it, and it is needed for the photo URL.

## The API

```
GET /api/values?place=veggli&from=<ISO date>&to=<ISO date>&v=1
```

`v` is the data version, `VALUES_VERSION` in `web/core/snapshot-values.js`. It is part of the cache key, and a request with another version is refused (HTTP 400).

- The client asks for whole UTC months, for example `from=2024-06-01T00:00:00.000Z&to=2024-06-30T23:59:59.999Z`. Every visitor asks for the same URLs, so the Cloudflare cache is shared.
- The newest part ends at the latest snapshot the page has: `from=<start of month>&to=<latest date>`.
- The answer is `immutable` when `to` is at or before the place's latest snapshot. This is the same rule as `/api/snapshots`, and `worker.js` caches it the same way.
- A span over 31 days is refused (HTTP 400).
- An answer holds at most 2,000 snapshots. If that cuts it, `to` in the answer is the time of its newest snapshot, and the browser asks for the rest.

Answer, in columns instead of one object per snapshot:

```json
{
  "v": 1,
  "from": "2024-06-01T00:00:00.000Z",
  "to": "2024-06-30T23:59:59.999Z",
  "imageBase": "https://vaerhona.s3-eu-west-1.amazonaws.com/veggli",
  "cuid": ["cj...", "cj..."],
  "time": [1717200123000, 1717203730000],
  "temperature": [12.4, 12.1],
  "humidity": [81, 83],
  "pressure": [1012, null],
  "yr": { "airTemperature": [11.9, null], "windSpeed": [2.1, null] }
}
```

`/api/snapshots` stays as it is. The place page keeps using it for the first week, so nothing gets slower if the local copy is empty or unavailable.

## The local database

IndexedDB database `vaerhona`, with two stores:

| Store | Key | Value |
|---|---|---|
| `months` | `[place, "2024-06"]` | The columns from `/api/values`, `imageBase`, and `coveredTo`: the time it is complete up to |
| `meta` | `place` | Data version, last time the place was opened |

One record per month, not one per snapshot. Ten years is 120 records instead of 87,600, which makes reads and writes fast on phones.

A finished month has `coveredTo` at the end of the month. The newest month has `coveredTo` at the latest snapshot when it was fetched. On the next visit, only the part from `coveredTo` to the new latest snapshot is fetched and added.

## Backfill

Order of work, most important first:

1. The month of the snapshot on screen (on a normal visit this is the current month).
2. The current month, if it is another one.
3. Then outwards, one month at a time, from both the month on screen and now. The month closest to either comes first.
4. Stop at the place's first snapshot.

When the user jumps to another date, the order is calculated again from that date. A month the arrows or the date picker need right now skips the queue.

Rules for the background work:

- Starts only after the photo on screen has loaded (rule P8).
- At most 2 requests at a time.
- Pauses while the page is hidden.
- With data saver enabled: no background backfill. Only what the user browses is stored.
- Only one tab does the work, using the Web Locks API (a browser feature that lets tabs take turns).

Time for a full backfill of 10 years (120 months), estimated: a few seconds when Cloudflare has the months cached (about 50 ms each), and about a minute for the first visitor ever, since each uncached request reads MongoDB (about 0.9 s).

## How the page uses it

`web/modules/snapshots-navigator/store.js` holds the snapshots the page has loaded, and `timeline.js` holds the parts of time that are complete ("ranges"). Both stay.

- **Arrows and date picker:** `store.load(part)` asks the history (`web/modules/snapshot-history/history.js`) for the months the part touches. The history reads the local database first, and asks `/api/values` only for what is missing. If the months hold no snapshot in the direction asked for, because the box was off, or if the history fails, the list API is asked as before.
- **Compare years:** the closest snapshot to the same time in each earlier year comes from the local months. If a month is missing, it is fetched and skips the queue.
- **Charts:** the chart button in the bottom bar swaps the photo for the graph view in `web/modules/snapshots-navigator/graph`. It reads months straight from the history, not through the timeline. Week and month draw every snapshot. Year and all draw one point per day: the mean as a line, with the lowest and highest value as a band. With compare enabled, each earlier year is its own line. The chart loads the months it needs first, and draws what it has while the rest loads.

The timeline in memory keeps only the months near the snapshot on screen. Loading 87,600 snapshots into it would make every merge slow.

## Browsers and phones

| | IndexedDB | Web Locks | Notes |
|---|---|---|---|
| Chrome, Edge, Android | Yes | Yes | |
| Firefox | Yes | Yes | Works in private windows, cleared when the window closes |
| Safari on Mac and iOS | Yes | Yes (15.4+) | See below |
| iOS home screen app | Yes | Yes | Has its own storage, separate from Safari |

Things that differ:

- **Safari deletes the data of a site that is not used for 7 days.** This applies to Safari tabs, not to a home screen app. The backfill simply runs again.
- **Any browser may delete the data when the disk is full.** The page asks for persistent storage (`navigator.storage.persist()`) to make this less likely. Firefox shows the user a prompt for this, see open question 2.
- **Storage can be missing or broken** (some private modes, a blocked site setting, a full disk). Every read and write is wrapped. On failure the page works as today, from memory and the network.
- **No Web Locks** (old browsers): each tab backfills on its own. Writes are whole months, so two tabs cannot corrupt each other.

## Why not the alternatives

| Option | Why not |
|---|---|
| Browser HTTP cache only (today) | Small and cleared often on phones, especially iOS. Cannot be queried, so a chart would need hundreds of requests on every visit. |
| Cache API with a service worker | Works, but a service worker sits between the page and the server on every request. A bug there could serve an old page and break F1. It only stores responses, so charts would still parse every month on each visit. |
| OPFS (private files in the browser) | Newer and less supported. Useful for one huge file or SQLite, which we do not need. |
| localStorage | Limited to about 5 MB, and blocks the page while reading. |

## Stale and wrong data

- **Only final answers are stored.** The browser keeps an answer only if the server marked it `immutable`. Any other answer is dropped, and browsing asks the list API as before.
- **A deleted or fixed snapshot** (known gap 3 in SPEC.md) does not reach clients by itself. The API answer has a version, `v`. Raising it in the code makes every client drop its local months and backfill again, and it changes the cache key at Cloudflare.
- **A place that is renamed or removed:** the API answers 404, and the client drops that place's months.
- **Old places:** a place not opened for a year is removed from the local database.

## Where the code is

| File | What it does |
|---|---|
| `web/core/snapshot-values.js` | The URL, the column format, UTC month helpers, `VALUES_VERSION` |
| `web/services/snapshot-values.js`, `web/pages/api/values.js` | The API |
| `web/list-cache.js` | Worker cache for both `/api/snapshots` and `/api/values` |
| `web/modules/snapshot-history/month-db.js` | IndexedDB, with memory as the fallback |
| `web/modules/snapshot-history/history.js` | Reads and loads months, and runs the backfill |
| `web/modules/snapshots-navigator/store.js` | Browsing asks the history first |
| `web/modules/snapshots-navigator/graph/` | The chart. `series.js` has the numbers, `index.js` draws them |

## Not done yet

- Run `/api/values` against MongoDB, and check the time for one uncached month.
- Measure a full backfill and the first chart draw on a phone, and the real storage size for the oldest place.
- Check on iOS Safari and as a home screen app.
- Run the freshness check in SPEC.md on a preview.

## Open questions for the owner

1. **Month or year per request?** Months are small and safe for the Worker (about 740 snapshots). Years mean 12 times fewer requests, but each reads about 8,760 snapshots from MongoDB, which may be slow or hit Worker limits. Proposal: start with months and measure.
2. **Ask for persistent storage in Firefox?** It shows a permission prompt. Built as proposed: asked only in a home screen app and in browsers that do not prompt (`web/modules/snapshot-history/persist.js`).
3. **Should the app open with no network?** Not in this design. It would need a service worker, and a clear "offline, not the latest" state so F1 is not broken.
4. **How long is the history?** The size and time numbers above assume 10 years. They should be checked against the oldest place.
