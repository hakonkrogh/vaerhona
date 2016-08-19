import { Router } from 'express';
import * as PlaceController from '../controllers/place.controller';

const router = new Router();

// Get one place by name
router.route('/places/:name').get(PlaceController.getPlace);

// Add a new place
router.route('/places').post(PlaceController.addPlace);

// Delete a place by name
router.route('/places/:name').delete(PlaceController.deletePlace);

export default router;