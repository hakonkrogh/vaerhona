// Export Constants
export const TOGGLE_ADD_SNAPSHOT = 'TOGGLE_ADD_SNAPSHOT';
export const SET_SELECTED_PLACE = 'SET_SELECTED_PLACE';

// Export Actions
export function toggleAddSnapshot () {
  return {
    type: TOGGLE_ADD_SNAPSHOT
  };
}
export function setSelectedPlace (place) {
	return {
		type: SET_SELECTED_PLACE,
		place
	};
}

export const getSelectedPlace = state => state.app.selectedPlace;
