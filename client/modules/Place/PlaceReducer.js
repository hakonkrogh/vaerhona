import { ADD_PLACE, ADD_PLACES, DELETE_PLACE } from './PlaceActions';

// Initial State
const initialState = { data: [] };

const PlaceReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_PLACE :
      return {
        data: [action.place, ...state.data]
      };

    case ADD_PLACES :
      return {
        data: action.places
      };

    case DELETE_PLACE :
      return {
        data: state.data.filter(place => place.cuid !== action.cuid)
      };

    default:
      return state;
  }
};

/* Selectors */

// Get all places
export const getPlaces = state => state.places.data;

// Get place by cuid
export const getPlace = (state, cuid) => state.places.data.filter(place => place.cuid === cuid)[0];

// Export Reducer
export default PlaceReducer;
