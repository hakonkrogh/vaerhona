import { Router } from 'express';
import * as PlaceController from '../controllers/place.controller';

const router = new Router();

// Add a new place
router.route('/places').post(PlaceController.addPlace);

// Get all places
router.route('/places').get(PlaceController.getPlaces);

// Gets all the data required to display a selected place
router.route('/placesselected/:name').get(PlaceController.getSelectedPlaceData);

// Get all places for frontpage
router.route('/placesfrontpage').get(PlaceController.getFrontpagePlaces);

// Get one place by name
router.route('/places/:name').get(PlaceController.getPlace);

// Delete a place by name
router.route('/places/:name').delete(PlaceController.deletePlace);

export default router;