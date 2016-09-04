import {
  ADD_PLACE,
  ADD_PLACES,
  DELETE_PLACE,
  UNSELECT_PLACE,
  CHANGE_MAIN_NAVIGATION
} from './PlaceActions';

// Initial State
const initialState = {
  data: [],
  selected: false
};

const PlaceReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_PLACE :
      return {
        data: [action.place, ...state.data],
        selected: action.place
      };

    case ADD_PLACES :
      console.log(action);
      return {
        data: [...state.data, ...action.places],
        selected: !state.selected && action.places ? action.places[action.places.length - 1] : state.selected
      };

    case DELETE_PLACE :
      let selected = state.selected;

      // We are deleting the selected one
      if (state.selected && state.selected.name === action.name) {
        selected = initialState.selected;
      }

      return {
        data: state.data.filter(place => place.cuid !== action.cuid),
        selected
      };

    case UNSELECT_PLACE :
      return {
        data: state.data,
        selected: initialState.selected
      }

    default:
      return state;
  }
};

/* Selectors */

// Get all places
export const getPlaces = state => state.places.data;

// Get selected place
export const getSelectedPlace = state => state.places.selected;

// Get place by cuid
export const getPlace = (state, cuid) => state.places.data.filter(place => place.cuid === cuid)[0];

// Get selected main navigation
export const getSelectedMainNavigation = state => state.places.mainNavigation;

// Export Reducer
export default PlaceReducer;