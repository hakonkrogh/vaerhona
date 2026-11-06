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

### What may be cached

| Data | May be cached? | Why |
|---|---|---|
| Latest snapshot of a place | Only as F4 describes | F1 |
| A snapshot photo, at any size | Yes, forever | The URL contains the snapshot's unique id, and the photo never changes. A new snapshot has a new URL. |
| A list of snapshots that ends before the place's latest snapshot | Yes, for a long time | Boxes only add snapshots dated now, so the past does not change. |
| A list of snapshots that could include a new snapshot | No, unless F4 holds | It would hide the newest snapshot. This includes any query with no end date, or with an end date near now. |
| Page HTML with no snapshot data in it | Yes | It only holds the place name and code. |
| Page HTML with snapshot data in it | Only as F4 describes | Same as the latest snapshot. |

### Uploads from boxes

| ID | Rule | Source |
|---|---|---|
| B1 | Boxes cannot be updated remotely, so `/api/graphql` must keep working for old box code. This includes both the `addSnapshot` and `snapshots.add` mutations. | Docs |
| B2 | A place's `lastSnapshot` moves only after the photo is stored, so the latest snapshot always has a photo. | Code |
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

### Front page and setup

| ID | Rule | Source |
|---|---|---|
| S1 | The front page lists up to 10 public places that have a snapshot, each with its latest photo and time. | Code |
| S2 | `/setup` connects to a box over Bluetooth to set wifi, read the sensors, take a photo, change box id, update, reboot and shut down. | Code |

The graph view exists in `web/modules/snapshots-navigator/graph` but is not in use.

## How to check the freshness rules

Run this after any change to loading or caching, on a preview or on production:

1. Note the newest snapshot for a place from the API.
2. Upload a new snapshot to the `test` place, or use "Ta bilde" in `/setup`.
3. As soon as the upload has finished, open the place page in a new private window.
4. The new photo and time must show on the first render.
5. Reload, and open the front page. Both must show the new snapshot too.

Also repeat step 3 after the page has not been visited for a long time, because that is when a stale cache would show.

## Known gaps

These are places where today's code does not meet the intent, or may not. All come from reading the code unless marked.

1. **An open page never updates.** `useRefreshQuery` in `web/core/utils.js` was written to refresh every 30 seconds, but reads `reexecuteQuery` from the wrong place, so the refresh never runs. See open question 1.
2. **Going back to a place in the same tab can show old data.** urql (the GraphQL client) keeps results in memory, so moving from a place to the front page and back can reuse the first result. This breaks F1 and is not yet tested live.
3. **A snapshot can exist without a photo.** The snapshot is saved before its photo. If the photo upload fails, `lastSnapshot` stays correct (B2), but the snapshot still shows up in the list when browsing.
4. **Forward paging has no sort.** A query with only a start date has no sort order in `getSnapshots`, so the order of results is not guaranteed.
5. **A date with no data gives no feedback.** The page keeps the old photo and shows no message. Veggli has no snapshots for 12 to 18 June 2024, for example.
6. **The front page order does nothing.** `getTopPublicPlaces` sorts on `lastSnapshot.dateAdded`, but `lastSnapshot` is only an id at that point.
7. **A request can hang.** One API request ran for over 6 minutes on 2026-11-06, while other requests worked. The cause is unknown (observed live, once).
8. **Boxes do not notice a failed upload.** `snapshots.add` catches errors and answers HTTP 200 with `success: false`. `device/logger.js` does not read `success`, so it logs "Snapshot sent" and does not retry. That snapshot is lost or left unpublished until the next upload.
9. **`firstSnapshot.image` in the API has a wrong URL.** The path contains `undefined` where the place name should be (observed live). The page does not use this field today. The latest snapshot record stores the correct URL.

## Open questions for the owner

1. Should an open page update by itself when a new snapshot arrives? The old code tried to. If yes, it must not throw away where the user has browsed to.
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

## Decisions

- **2026-11-06: The first view does not use ISR with `revalidate`.** It would load faster, but can show an older snapshot, which breaks F1 and F3.
- **2026-11-06: The latest data gets no short TTL cache.** Same reason. A TTL of even one minute can hide a new snapshot.
- **2026-11-06 (proposed): Uploads maintain a latest snapshot record in R2.** It is how we plan to meet F4. See [the design](docs/latest-snapshot-design.md).
