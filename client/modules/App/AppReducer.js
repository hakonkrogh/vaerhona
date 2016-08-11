// Import Actions
import { TOGGLE_ADD_SNAPSHOT, SET_SELECTED_PLACE } from './AppActions';

// Initial State
const initialState = {
  showAddSnapshot: false,
  selectedPlace: { name: 'todo...', cuid: '' }
};

const AppReducer = (state = initialState, action) => {
  switch (action.type) {

  	case TOGGLE_ADD_SNAPSHOT:
      return {
        showAddSnapshot: !state.showAddSnapshot,
        selectedPlace: state.selectedPlace
      };

    case SET_SELECTED_PLACE:
      return {
      	showAddSnapshot: state.showAddSnapshot,
      	selectedPlace: action.place
      };

    default:
      return state;
  }
};

/* Selectors */
export const getShowAddSnapshot = state => state.app.showAddSnapshot;
export const getSelectedPlace = state => state.app.selectedPlace;

// Export Reducer
export default AppReducer;
