# Design: front page from latest snapshot records

Status: built, 2026-11-09. Builds on [the latest snapshot record design](latest-snapshot-design.md).

## Summary

The front page reads the latest snapshot records in R2 (Cloudflare file storage) instead of MongoDB. It falls back to MongoDB when anything is missing or not trusted, as the place page does.

Three changes make this work:

1. **A record is trusted if it was checked against MongoDB in the last 90 minutes.** Before, a record was trusted if its snapshot was under 90 minutes old. Each record now has a `confirmedAt` time.
2. **Every upload checks the records of the other front page places**, and writes them again with a new `confirmedAt`. This keeps a record trusted for a place whose box has stopped uploading, such as Tornes (no upload since April 2026).
3. **Every upload writes the list of front page places**, so the front page does not need MongoDB to know which places to show.

Rules F1 to F6 in [SPEC.md](../SPEC.md) still hold.

## Why

As a home screen app on iOS, the front page is usually the first page people see. Reading MongoDB takes about 1-1.8 s from the Worker, while a page that reads a record answers in about 130-250 ms (measured 2026-11-09, with Worker placement disabled).

Before this change, the front page could not use records. Tornes is on the front page but has no record, and an old record would not be trusted by the 90 minute rule.

## Which places the front page shows

Public places with a snapshot from the last 364 days, up to 10, in the same order as today. A place with no snapshot for 364 days is left off, but its page still works by URL. The same rule applies to the MongoDB path and the `places` API query, so all three agree.

## The trust rule

A record is trusted when `confirmedAt` is less than 90 minutes old. For an old record without `confirmedAt`, the snapshot date is used, which is the old rule.

`confirmedAt` is set only by code that has just read the place from MongoDB:

- **The place's own upload**, after it moves `lastSnapshot` (as before).
- **Another place's upload**, in the check described below.

If no box uploads for 90 minutes, every record stops being trusted, and both pages read MongoDB until the next upload. That is slower but correct.

## Write path

After an upload has published its own record (unchanged from before), it does this. A failure here is logged and does not fail the upload.

1. **List the record versions.** One R2 list call returns every record with its etag, a version tag that changes on every write.
2. **Read the front page places from MongoDB**, with their first and last snapshots. The upload already has a connection open.
3. **Write the front page list:** `front-page/v1.json` with the place names and the time.
4. **Check each other place's record:** build a new record from the MongoDB data, with `confirmedAt` set to now, and write it only if the record has not changed since step 1:
   - Record existed in step 1: write only if the etag still matches.
   - Record was missing, and the place's last snapshot is more than 24 hours old: write only if it is still missing (`If-None-Match: *`).
   - Record was missing, and the place uploaded in the last 24 hours: leave it missing. Its own upload failed to write it, and the page reads MongoDB until its next upload, as before.

R2 checks these conditions as part of the write, so a write that loses a race is refused instead of stored.

### Why the order matters

Step 1 must come before step 2. If MongoDB were read first, this could happen: the check reads the old snapshot from MongoDB, the place's own upload then writes its new record, the check reads the new record's etag, and its write goes through with old data. Reading the etags first means any upload in between changes the etag, and the write is refused.

### What happens in each race

| Situation | Result |
|---|---|
| The place's own upload deletes its record after step 1 | The check's write is refused, because the record is gone |
| The place's own upload writes its new record after step 1 | The check's write is refused, because the etag changed |
| The place's own upload finished before step 1 | The check reads the new data from MongoDB, so its write is correct |
| Two uploads check the same place at once | One write wins. Both hold MongoDB data from the same moment, or the loser is refused |
| Two uploads write the front page list at once | Harmless. The list holds only names, not snapshot data |

## Read path

The front page:

1. Reads the front page list. If it is missing or more than 90 minutes old, use MongoDB.
2. Reads the record of every listed place, in parallel, waiting at most 500 ms in total.
3. If every record is trusted, renders from the records. Otherwise uses MongoDB for the whole page.

The place page uses the same trust rule. A quiet place like Tornes now gets a trusted record too, so its page gets fast as well.

## Accepted downsides

- **A quiet box that comes back at the wrong moment.** Tornes has no record. If Tornes uploads at the same second as another box's check creates Tornes's record, and Tornes's own record write then fails three times, the check's record could hold the previous snapshot for up to one upload interval. The next check corrects it, since it writes MongoDB's data with the matching etag. This needs a rare race and a rare R2 failure at the same time, so we accept it.
- **Changes to `isPublic` show up at the next upload**, up to about an hour later, because the front page list is written by uploads.
- **Manual database edits** are still not seen by the records until the next upload rewrites them (at most about an hour now, since every upload rewrites all front page records). Deleting the record for that place is still the fastest fix.
- **Uploads do more work:** one R2 list, one MongoDB query and up to 10 R2 writes. Boxes do not wait on the answer in a way that matters.

## How to check after the deploy

- The upload logs show `[front-page] ...` lines with how many records were written, refused and skipped.
- The front page logs `[front-page] source=records` or `source=mongo`.
- The monitor's freshness checks compare the front page with the API, including right after uploads.
