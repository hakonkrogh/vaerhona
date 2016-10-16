import {
  ADD_PLACE,
  ADD_SELECTED_PLACE,
  ADD_PLACES,
  ADD_FRONTPAGE_PLACES,
  DELETE_PLACE,
  UNSELECT_PLACE,
  CHANGE_MAIN_NAVIGATION,
  TOGGLE_LOADING_SELECTED_PLACE,
  PLACE_NOT_FOUND
} from './PlaceActions';

// Initial State
const initialState = {
  data: [],
  frontpagePlaces: [],
  selected: false,
  selectedNotFound: false,
  loadingSelected: false
};

const PlaceReducer = (state = initialState, action) => {
  switch (action.type) {

    case TOGGLE_LOADING_SELECTED_PLACE : {
      return {
        data: state.data,
        frontpagePlaces: state.frontpagePlaces,
        selected: action.place,
        selectedNotFound: initialState.selectedNotFound,
        loadingSelected: action.loading
      };
    }

    case ADD_PLACE : {
      return {
        data: [action.place, ...state.data],
        frontpagePlaces: state.frontpagePlaces,
        selected: action.place,
        selectedNotFound: state.selectedNotFound,
        loadingSelected: state.loadingSelected
      };
    }

    case ADD_SELECTED_PLACE : {
      
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
        selected: action.place,
        selectedNotFound: state.selectedNotFound,
        loadingSelected: false
      };
    }

    case ADD_PLACES : {
      return {
        data: [...state.data, ...action.places],
        frontpagePlaces: state.frontpagePlaces,
        selected: state.selected,
        selectedNotFound: state.selectedNotFound,
        loadingSelected: state.loadingSelected
      };
    }

    case DELETE_PLACE : {
      let selected = state.selected;

      // We are deleting the selected one
      if (state.selected && state.selected.name === action.name) {
        selected = initialState.selected;
      }

      return {
        data: state.data.filter(place => place.cuid !== action.cuid),
        frontpagePlaces: state.frontpagePlaces,
        selected,
        selectedNotFound: state.selectedNotFound,
        loadingSelected: state.loadingSelected
      };
    }

    case UNSELECT_PLACE : {
      return {
        data: state.data,
        frontpagePlaces: state.frontpagePlaces,
        selected: initialState.selected,
        selectedNotFound: initialState.selectedNotFound,
        loadingSelected: state.loadingSelected
      }
    }

    case ADD_FRONTPAGE_PLACES : {
      return {
        data: state.data,
        frontpagePlaces: action.places,
        selected: state.selected,
        selectedNotFound: state.selectedNotFound,
        loadingSelected: state.loadingSelected
      }
    }

    case PLACE_NOT_FOUND : {
      state.selectedNotFound = false;
      state.loadingSelected = false;
      return state;
    }

    default :
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

// Get selected place loading state
export const getSelectedPlaceLoading = state => state.places.loadingSelected;

// Get selected place not found state
export const getSelectedPlaceNotFound = state => state.places.selectedNotFound;

// Get place by cuid
export const getPlace = (state, cuid) => state.places.data.filter(place => place.cuid === cuid)[0];

// Get selected main navigation
export const getSelectedMainNavigation = state => state.places.mainNavigation;

// Export Reducer
export default PlaceReducer;