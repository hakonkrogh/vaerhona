/**
 * Creates the index behind the snapshot list queries. Safe to run again.
 * Reads and other uploads keep working while the index builds.
 *
 * Usage, from web/:
 *   MONGO_DB_URI='mongodb+srv://...' node scripts/create-snapshot-index.mjs [placeName]
 *
 * It prints the query plan before and after, using placeName (default veggli).
 */
import mongoose from 'mongoose';

const INDEX = { placeCuid: 1, dateAdded: -1 };
const INDEX_NAME = 'placeCuid_1_dateAdded_-1';

if (!process.env.MONGO_DB_URI) {
  console.error('MONGO_DB_URI is not set');
  process.exit(1);
}

const placeName = process.argv[2] ?? 'veggli';

function collectStages(plan, stages = []) {
  stages.push(plan.stage);
  for (const child of [plan.inputStage, ...(plan.inputStages ?? [])]) {
    if (child) {
      collectStages(child, stages);
    }
  }
  return stages;
}

async function describePlans(snapshots, placeCuid) {
  const now = new Date();
  const queries = {
    'newest before a date': snapshots
      .find({ placeCuid, dateAdded: { $lte: now } })
      .sort({ dateAdded: -1 })
      .limit(168),
    'oldest after a date': snapshots
      .find({ placeCuid, dateAdded: { $gte: new Date('2020-01-01') } })
      .sort({ dateAdded: 1 })
      .limit(168),
    'date range': snapshots
      .find({
        placeCuid,
        dateAdded: {
          $gte: new Date(now.getTime() - 3 * 86400000),
          $lte: now,
        },
      })
      .sort({ dateAdded: 1 }),
  };

  for (const [name, cursor] of Object.entries(queries)) {
    const { queryPlanner, executionStats } = await cursor.explain(
      'executionStats'
    );
    // Some query engines nest the plan under queryPlan.
    const plan = queryPlanner.winningPlan.queryPlan ?? queryPlanner.winningPlan;
    const stages = collectStages(plan).join(' < ');
    console.log(
      `  ${name}: ${stages}, read ${executionStats.totalDocsExamined} docs, returned ${executionStats.nReturned}, ${executionStats.executionTimeMillis} ms`
    );
  }
}

const connection = await mongoose
  .createConnection(process.env.MONGO_DB_URI, { autoIndex: false })
  .asPromise();

try {
  const snapshots = connection.collection('snapshots');
  const place = await connection
    .collection('snapshotplaces')
    .findOne({ name: placeName });

  if (!place) {
    throw new Error(`Place "${placeName}" not found`);
  }

  console.log(
    'Existing indexes:',
    (await snapshots.indexes()).map((index) => index.name).join(', ')
  );

  console.log(`Before, for ${placeName}:`);
  await describePlans(snapshots, place.cuid);

  console.log(`Creating ${INDEX_NAME}...`);
  const started = Date.now();
  await snapshots.createIndex(INDEX, { name: INDEX_NAME });
  console.log(`Done in ${Math.round((Date.now() - started) / 1000)} s`);

  console.log(`After, for ${placeName}:`);
  await describePlans(snapshots, place.cuid);
} finally {
  await connection.close();
}
