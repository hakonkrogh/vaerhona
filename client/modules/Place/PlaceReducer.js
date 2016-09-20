import {
  ADD_PLACE,
  ADD_PLACES,
  ADD_FRONTPAGE_PLACES,
  DELETE_PLACE,
  UNSELECT_PLACE,
  CHANGE_MAIN_NAVIGATION
} from './PlaceActions';

// Initial State
const initialState = {
  data: [],
  frontpagePlaces: [],
  selected: false
};

const PlaceReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_PLACE :

      let data = state.data;
      let isInData = false;
      for (let item of data) {
        if (item.cuid === action.place.cuid) {
          isInData = true;
          break;
        }
      }

      if (!isInData) {
        data = [action.place, ...data];
      }

      return {
        data,
        frontpagePlaces: state.frontpagePlaces,
        selected: action.place
      };

    case ADD_PLACES :
      return {
        data: [...state.data, ...action.places],
        frontpagePlaces: state.frontpagePlaces,
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
        frontpagePlaces: state.frontpagePlaces,
        selected
      };

    case UNSELECT_PLACE :
      return {
        data: state.data,
        frontpagePlaces: state.frontpagePlaces,
        selected: initialState.selected
      }

    case ADD_FRONTPAGE_PLACES :
      return {
        data: state.data,
        frontpagePlaces: action.places,
        selected: state.selected
      }

    default:
      return state;
  }
};

/* Selectors */

// Get all places
export const getPlaces = state => state.places.data;

// Get all places for frontpage
export const getFrontpagePlaces = state => state.places.frontpagePlaces;

// Get selected place
export const getSelectedPlace = state => state.places.selected;

// Get place by cuid
export const getPlace = (state, cuid) => state.places.data.filter(place => place.cuid === cuid)[0];

// Get selected main navigation
export const getSelectedMainNavigation = state => state.places.mainNavigation;

// Export Reducer
export default PlaceReducer;