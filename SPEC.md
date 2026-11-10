# Værhøna spec

What the application is for, and the rules that must keep working.
Read this before changing how data is loaded or cached.
If a change breaks a rule here, change the rule on purpose in the same PR, or do not make the change.

**Source of each rule**

- **Owner:** stated by the project owner.
- **Docs:** already written in a README.
- **Code:** inferred from today's code. Not yet confirmed by the owner, so it may describe an accident and not an intent.

## Purpose

Værhøna shows what the weather looks like right now at a place, using a photo and sensor values from a small box installed there. People can also go back in time and look at earlier photos from the same place.

The main question the site answers is: **what does it look like there now?**

## Parts of the system

- **Box:** a Raspberry Pi with a camera and sensors, code in `device/`. It takes a snapshot when it starts, then every hour, and also after a manual "Ta bilde" from `/setup`. Boxes reboot once a day, which moves the schedule, so uploads do not come at fixed times.
- **Snapshot:** one photo plus the sensor values from one moment. The photo is stored in S3 (AWS file storage), and the values in MongoDB.
- **Place:** a named location, such as `veggli` or `myking`. A box belongs to one place. A place points to its newest snapshot through `lastSnapshot`.
- **Website and API:** Next.js on Cloudflare Workers, code in `web/`. Boxes upload through `/api/graphql`, and the pages read from the same endpoint.

## Rules

### Latest means latest

| ID | Rule | Source |
|---|---|---|
| F1 | Opening a place page shows the place's latest stored snapshot, both photo and values. An older snapshot is a broken page, even if it is only one snapshot old. | Owner |
| F2 | Speed never overrides F1. A slow correct page is better than a fast wrong one. | Owner |
| F3 | A cache based only on time (TTL, ISR `revalidate`, stale-while-revalidate) must not serve the latest snapshot. Uploads do not come at fixed times, so no time limit is safe. | Owner |
| F4 | The latest snapshot may be cached only if a finished upload makes that cache correct before anyone can read it again. | Follows from F1 |
| F5 | Do not show an older snapshot first and swap it for the latest one afterwards. A loading state is allowed. See open question 2. | Follows from F1 |
| F6 | The front page shows the latest snapshot for each place, under the same rules. | Code |
| F7 | The browser's local database never supplies the latest snapshot and never decides which one it is. The page gets that from the server on every visit. The local database may be empty or cleared at any time, and the page must work the same. | Owner |

### What may be cached

| Data | May be cached? | Why |
|---|---|---|
| Latest snapshot of a place | Only as F4 describes | F1 |
| A snapshot photo, at any size | Yes, forever | The URL contains the snapshot's unique id, and the photo never changes. A new snapshot has a new URL. |
| A list of snapshots that ends at or before the place's latest snapshot | Yes, forever | Boxes only add snapshots dated now, which is after the latest snapshot, so the list can never change. `/api/snapshots` marks these lists `immutable`, and the Worker keeps them in the Cloudflare cache. |
| A list of snapshots that could include a new snapshot | No, unless F4 holds | It would hide the newest snapshot. This includes any query with no end date, or with an end date near now. |
| The values of the snapshots in a part of time that ends at or before the place's latest snapshot | Yes, forever | Same reason as a list. `/api/values` gives them in a compact form and marks them `immutable`, and the Worker keeps them in the Cloudflare cache. |
| The browser's local database of snapshot values | Yes, until the data version changes | It holds only values from `/api/values` at or before the latest snapshot the page got from the server. See F7. |
| Page HTML with no snapshot data in it | Yes | It only holds the place name and code. |
| Page HTML with snapshot data in it | Only as F4 describes | Same as the latest snapshot. |

### Uploads from boxes

| ID | Rule | Source |
|---|---|---|
| B1 | Boxes cannot be updated remotely, so `/api/graphql` must keep working for old box code. This includes both the `addSnapshot` and `snapshots.add` mutations. | Docs |
| B2 | A place's `lastSnapshot` moves only after the upload's photo is stored. See known gap 10 for uploads with no photo. | Code |
| B3 | A box that is not paired to a place uploads to the place named `test`. | Code |
| B4 | Weather from yr.no (the Norwegian weather service) is fetched at upload and stored with the snapshot. It is not fetched when someone views the page. | Code |
| B5 | A temperature outside -50 to 50 °C is replaced with the yr.no temperature when one is available. | Code |

### Place page

| ID | Rule | Source |
|---|---|---|
| P1 | The page shows the photo, the time as both "time ago" and full date, temperature and humidity, plus wind and weather condition when yr.no data exists. | Code |
| P2 | Humidity uses the yr.no value when there is one, otherwise the sensor value. | Code |
| P3 | The arrows move one snapshot or 24 hours, backwards and forwards. | Code |
| P4 | A user cannot move forward past the latest snapshot. | Code |
| P5 | The date picker jumps to the closest snapshot on the chosen date. It allows dates from the first snapshot up to today. | Code |
| P6 | Compare shows the same time in earlier years. It is available only when the current snapshot is more than one year newer than the place's first snapshot. | Code |
| P7 | Dates and times are shown in Norwegian, in the `Europe/Oslo` time zone, for every viewer. | Code |
| P8 | The arrows should answer at once. The page loads ahead the snapshots and photos they lead to, but only after the photo on screen has loaded. | Owner |
| P9 | The chart button swaps the photo for a chart of temperature or humidity. The periods are week, month, year and all, and each ends at the snapshot on screen. Year and all show one point per day. With compare enabled, each earlier year is its own line. | Owner |
| P10 | The page fills the browser's local database with the place's whole history in the background, outwards from the snapshot on screen and from now. It starts only after the photo on screen has loaded, pauses while the page is hidden, and does not run with data saver enabled. | Owner |

### Front page and setup

| ID | Rule | Source |
|---|---|---|
| S1 | The front page lists up to 10 public places that have a snapshot from the last 364 days, each with its latest photo and time. A place with only older snapshots is left off, but its page still works by URL. | Owner |
| S2 | `/setup` connects to a box over Bluetooth to set wifi, read the sensors, take a photo, change box id, update, reboot and shut down. | Code |

## How to check the freshness rules

Run this after any change to loading or caching, on a preview or on production:

1. Note the newest snapshot for a place from the API.
2. Upload a new snapshot to the `test` place, or use "Ta bilde" in `/setup`.
3. As soon as the upload has finished, open the place page in a new private window.
4. The new photo and time must show on the first render.
5. Reload, and open the front page. Both must show the new snapshot too.
6. On the place page, go back one step. It must show the snapshot just before the new one.

Also repeat step 3 after the page has not been visited for a long time, because that is when a stale cache would show.

## Known gaps

These are places where today's code does not meet the intent, or may not. All come from reading the code unless marked.

1. **An open page that stays on screen does not update.** Since 2026-11-09 a page checks `/api/latest` when it becomes visible again, for example when the home screen app is opened after a while, and gets its data again if a snapshot is newer. A page that is left visible the whole time is still not updated. See open question 1.
2. **Going back to the front page in the same tab could show old data.** urql (the GraphQL client) kept the front page result in memory. Since 2026-11-09 the front page is rendered on the server like the place page, so it no longer uses urql, and a page restored by the browser's back-forward cache reloads. Checked live on 2026-11-09: a client-side back asks the server again.
3. **A snapshot can exist without a photo.** The snapshot is saved before its photo. If the photo upload fails, `lastSnapshot` stays correct (B2), but the snapshot still shows up in the list when browsing. Snapshot lists are cached forever (see "What may be cached"), so deleting such a snapshot does not reach a list that is already cached. The same goes for values in the Cloudflare cache and in browsers' local databases, until `VALUES_VERSION` in `web/core/snapshot-values.js` is raised.
4. **Forward paging had no sort.** Fixed on 2026-11-06: `getSnapshots` now sorts by date in every case.
5. **A date with no data gives no feedback.** Since 2026-11-09 the page jumps to the closest snapshot on another date, but it does not say that the chosen date had none. Veggli has no snapshots for 12 to 18 June 2024, for example.
6. **The front page order does nothing.** `getTopPublicPlaces` sorts on `lastSnapshot.dateAdded`, but `lastSnapshot` is only an id at that point.
7. **A request can hang.** One API request ran for over 6 minutes on 2026-11-06, while other requests worked. The cause is unknown (seen live). Three later timing runs that day each had one request that failed or took over 20 seconds, but they did not record the cause, so they may or may not be the same problem.
8. **Boxes do not notice a failed upload.** `snapshots.add` catches errors and answers HTTP 200 with `success: false`. `device/logger.js` does not read `success`, so it logs "Snapshot sent" and does not retry. That snapshot is lost or left unpublished until the next upload.
9. **`firstSnapshot.image` in the API has a wrong URL.** The path contains `undefined` where the place name should be (observed live). The page does not use this field today. The latest snapshot record stores the correct URL.
10. **An upload with no photo still becomes the latest.** The `image` field is optional in both mutations, and `lastSnapshot` moves anyway, so the page would show a broken photo. Current box code always sends a photo.

## Open questions for the owner

1. Should an open page update by itself when a new snapshot arrives? The old code tried to. If yes, it must not throw away where the user has browsed to. Partly answered on 2026-11-09 (owner): yes when the page becomes visible again. It then updates only while the latest snapshot is on screen and years are not being compared. Still open: should a page that stays visible also update, for example every few minutes?
2. Is F5 too strict? A cached photo followed by a quick swap to the latest would feel faster, but shows wrong data for a moment.
3. What does `isPublic` mean? Today it only controls the front page list. A place with `isPublic: false` can still be opened by name, through both the page and the API. Are those places meant to be private?
4. How fast should a page be? There is no target yet. See the baseline below.

## Performance baseline

Measured on 2026-11-06 from Norway against production, with no changes applied. Use this to judge later work.

| Measure | Time |
|---|---|
| API request that skips the database | ~20 ms |
| API request that only opens a MongoDB connection | ~560 ms |
| `PLACE` query (place with first and last snapshot) | ~760-820 ms |
| `PLACE_SNAPSHOTS` query (168 snapshots) | ~1,050 ms |
| Optimized photo (no cache, every fetch) | ~200-500 ms |
| Page HTML, usual | 40-70 ms |
| Page HTML, sometimes | 0.3-1.3 s |

### After the first speed work

Measured on 2026-11-06 from Norway against production, after the snapshot index, the latest snapshot record and Worker placement went live. Each row is the median of 20 requests, measured as the wait for the first byte after the connection is open. A browser's full load takes longer, since it also fetches scripts and the photo. Page times include the data, because the server puts it in the HTML. The Worker ran in London (`cf-placement: remote-LHR`). Photos were not measured.

| Measure | Time |
|---|---|
| Place page that reads the record (Veggli) | ~200 ms |
| Place page that reads the record (Myking) | ~180 ms |
| Place page that reads MongoDB (Tornes, no recent upload) | ~470 ms |
| API request that only opens a MongoDB connection | ~330 ms |
| `snapshots` query (1 snapshot, only `cuid` and `date`) | ~370 ms |
| `PLACE_SNAPSHOTS` query (168 snapshots) | ~430 ms |

A few requests were much slower. Across the runs, the slowest Veggli page took about 4 s and the slowest Myking page about 1.6 s, the latter just after a deploy. Veggli was always measured first, so this may be the Worker warming up. The cause is not confirmed.

### Slowdown since 2026-11-07

From about 12:23-12:35 UTC on 2026-11-07, the first request in each 15-minute check got much slower, and it stayed that way. Medians of the wait for the first byte, from Norway:

| Request | Before (25 checks) | After (37 checks) |
|---|---|---|
| Front page (then static HTML, no database) | 83 ms | 1,226 ms |
| Place page that reads the record (Veggli) | 208 ms | 1,539 ms |
| `places` query | 735 ms | 1,256 ms |

The front page was static HTML and did not touch MongoDB, so the delay is in the Worker or the Cloudflare network, not the database. The image cache (#50) went live at 12:34 and was reverted for 3 hours on 2026-11-09 as a test. It was just as slow without it, so #50 is not the cause.

Worker placement was the main cause. It was disabled on 2026-11-09 at 13:20 UTC, and the Myking page was fast again in the first check after that (210 ms). Why placement got slow on 2026-11-07 is not known. A smaller Worker bundle (19.2 MB to 11.7 MB) went live 10 minutes later, so its own effect could not be measured.

### After placement was disabled

Measured from Norway against production, from 2026-11-09 17:16 UTC to 2026-11-10 05:16 UTC, with one check every 15 minutes (48 checks). By then placement was disabled and the front page read the records. "Before" is the morning of 2026-11-09, 08:09 to 12:09 UTC (16 checks), with placement enabled. First byte is the wait for the first byte after the connection is open. Drawn is the time until the largest element on the page, usually the photo, is drawn in headless Chrome (LCP).

| Request | Before, median | After, median | After, 90th percentile |
|---|---|---|---|
| Front page, first byte | 1,312 ms (static HTML) | 362 ms | 912 ms |
| Veggli page, first byte | 1,766 ms | 156 ms | 274 ms |
| Myking page, first byte | 2,192 ms | 144 ms | 287 ms |
| Tornes page, first byte | 1,944 ms (read MongoDB) | 132 ms | 229 ms |
| `places` query (GraphQL, reads MongoDB) | 1,277 ms | 858 ms | 1,218 ms |
| `snapshots` query, 168 snapshots (GraphQL, reads MongoDB) | 909 ms | 876 ms | 1,063 ms |
| Front page, drawn | 1,996 ms | 322 ms | 652 ms |
| Veggli page, drawn | 664 ms | 166 ms | 292 ms |
| Myking page, drawn | 768 ms | 184 ms | 244 ms |

- No request failed in the 48 checks, and no check saw an older snapshot than the API gave.
- The first request after idle time is slower. In a test on 2026-11-09, after about 12 minutes with no requests from the test, the first page took 645 ms and one later page took 885 ms, whichever pages they were. The others took 165-275 ms. This is most likely the Worker starting up. The front page comes first in each check, which explains its higher 90th percentile.
- Requests that read MongoDB did not get faster. The 168-snapshot query took about 430 ms on 2026-11-06, when placement worked well.

## Decisions

- **2026-11-06: The Worker runs in `aws:eu-west-1`, next to MongoDB Atlas and S3.** Each MongoDB request takes several round trips, so being close saves more than the longer path from a visitor to the Worker costs. Measured from Norway, a 168-snapshot query with the same fields went from about 740 ms to about 445 ms, and pages that read the record got about 40 ms slower. On 2026-11-06 Cloudflare ran the Worker in London for this setting, which is near enough to help. Check the `cf-placement` header for the current location, since Cloudflare can change it. Static assets still come from the location nearest the visitor. Replaced on 2026-11-10 (see below).
- **2026-11-06: The first view does not use ISR with `revalidate`.** It would load faster, but can show an older snapshot, which breaks F1 and F3.
- **2026-11-06: The latest data gets no short TTL cache.** Same reason. A TTL of even one minute can hide a new snapshot.
- **2026-11-06: Uploads maintain a latest snapshot record in R2, and the place page reads it.** This is how we meet F4. See [the design](docs/latest-snapshot-design.md).
- **2026-11-09: The front page is rendered on the server from MongoDB, on every request.** Before, the server sent an empty page, and the browser had to load the scripts, then the front page code, then ask the API, before anything showed. As a home screen app on iOS this meant seconds of black and then white. It does not use the latest snapshot records, because a place with no recent upload has no record, and the front page lists those places too (Tornes had not uploaded since April 2026). The first byte now waits for MongoDB, but nothing else has to load before the photos. Later the same day, the front page moved to the records (next decision).
- **2026-11-09: A record is trusted if it was checked against MongoDB in the last 90 minutes, and the front page reads the records.** Every upload checks the records of the other front page places and writes the list of front page places, so a place whose box is quiet keeps a trusted record. MongoDB is still the fallback for anything missing or not trusted. See [the design](docs/front-page-records-design.md).
- **2026-11-09: Browsing loads ahead, and its lists are cached.** The arrows used to wait for the week's list (about 800 ms on every page view, measured with Worker placement off) and then for each photo (about 600 ms when the Worker had not cached it). Now:
  - The place page reads lists from `/api/snapshots` instead of GraphQL. Every list it asks for ends at or before the latest snapshot on the page, so the list is final, and the browser and the Worker keep it (see the cache table above).
  - The week before the latest snapshot starts loading with the HTML, through a `preload` link.
  - The next week loads in the background when the user gets within 4 days of the end of what is loaded.
  - After the photo on screen has loaded, the photos the arrows lead to load, then a few more steps back. With data saver on, only the arrow photos load.
- **2026-11-10: Worker placement is disabled, so the Worker runs at the location nearest the visitor.** This replaces the placement decision of 2026-11-06. From 2026-11-07, with placement enabled, a page that reads a record took about 1.8 s. With placement disabled it takes about 150 ms (see "After placement was disabled"). The cost is that a request that reads MongoDB takes about 0.9 s, against about 430 ms on the day placement worked well. That matters less now: the first view of the place page and the front page reads the records, and browsing lists are cached after the first request. Placement was disabled as a test on 2026-11-09 and kept after the 12-hour check. Measure before enabling it again.
- **2026-11-10: The browser keeps the values of a place's whole history in a local database (IndexedDB), and browsing, compare and charts read it first.** History never changes, so a copy in the browser is always correct up to the latest snapshot the page got from the server (F7). Values come from a new API, `/api/values`, one UTC month per request, so every visitor asks for the same URLs and shares the Cloudflare cache. The first week still comes from `/api/snapshots`, loaded with the HTML as before. Photos are not stored. Not yet measured against production data. See [the design](docs/client-storage-design.md).
