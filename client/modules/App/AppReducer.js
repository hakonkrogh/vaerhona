// Import Actions
import { TOGGLE_ADD_SNAPSHOT } from './AppActions';

// Initial State
const initialState = {
  showAddSnapshot: false
};

const AppReducer = (state = initialState, action) => {
  switch (action.type) {

  	case TOGGLE_ADD_SNAPSHOT:
      return {
        showAddSnapshot: !state.showAddSnapshot,
        selectedPlace: state.selectedPlace
      };

    default:
      return state;
  }
};

/* Selectors */
export const getShowAddSnapshot = state => state.app.showAddSnapshot;

// Export Reducer
export default AppReducer;
