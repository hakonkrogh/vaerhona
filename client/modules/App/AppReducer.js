// Import Actions
import {
  TOGGLE_ADD_SNAPSHOT,
  CHANGE_MAIN_NAVIGATION,
  MAIN_NAVIGATION_ITEMS
} from './AppActions';

// Initial State
const initialState = {
  showAddSnapshot: false,
  mainNavigation: MAIN_NAVIGATION_ITEMS[0]
};

const AppReducer = (state = initialState, action) => {
  switch (action.type) {

  	case TOGGLE_ADD_SNAPSHOT:
      return {
        showAddSnapshot: !state.showAddSnapshot,
        mainNavigation: state.mainNavigation
      };

    case CHANGE_MAIN_NAVIGATION :
      let mainNavigation = state.mainNavigation;

      // Check for valid navigation names
      if (MAIN_NAVIGATION_ITEMS.includes(action.name)) {
        mainNavigation = action.name
      }

      return {
        showAddSnapshot: state.showAddSnapshot,
        mainNavigation
      };

    default:
      return state;
  }
};

/* Selectors */
export const getShowAddSnapshot = state => state.app.showAddSnapshot;

// Get selected main navigation
export const getSelectedMainNavigation = state => state.app.mainNavigation;

// Export Reducer
export default AppReducer;