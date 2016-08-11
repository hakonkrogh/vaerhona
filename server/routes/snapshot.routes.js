import { Router } from 'express';
import * as SnapshotController from '../controllers/snapshot.controller';
const router = new Router();

// Get all snapshots
router.route('/snapshots').get(SnapshotController.getSnapshots);

// Get one snapshot by cuid
router.route('/snapshots/:cuid').get(SnapshotController.getSnapshot);

// Add a new snapshot
router.route('/snapshots').post(SnapshotController.addSnapshot);

// Delete a snapshot by cuid
router.route('/snapshots/:cuid').delete(SnapshotController.deleteSnapshot);

export default router;
