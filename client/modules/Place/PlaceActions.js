import callApi from '../../util/apiCaller';

// Export Constants
export const ADD_PLACE = 'ADD_PLACE';
export const ADD_SELECTED_PLACE = 'ADD_SELECTED_PLACE';
export const ADD_PLACES = 'ADD_PLACES';
export const ADD_FRONTPAGE_PLACES = 'ADD_FRONTPAGE_PLACES';
export const DELETE_PLACE = 'DELETE_PLACE';
export const UNSELECT_PLACE = 'UNSELECT_PLACE';
export const TOGGLE_LOADING_SELECTED_PLACE = 'TOGGLE_LOADING_SELECTED_PLACE';

// Export Actions
export function addPlace (place) {
  return {
    type: ADD_PLACE,
    place
  };
}

export function addSelectedPlace ({ place, snapshots }) {
  return {
    type: ADD_SELECTED_PLACE,
    place,
    snapshots
  };
}

export function toggleSelectedLoading (loading) {
  return {
    type: TOGGLE_LOADING_SELECTED_PLACE,
    loading
  };
}

export function unselectPlace () {
  return {
    type: UNSELECT_PLACE
  };
}

export function addPlaceRequest (place) {
  return dispatch => {
    return callApi('place', 'post', {
      place: {
        cuid: place.cuid,
        name: place.name
      },
    }).then(res => dispatch(addPlace(res.place)));
  };
}

export function addPlaces (places) {
  return {
    type: ADD_PLACES,
    places
  };
}

export function addFrontpagePlaces (places) {
  return {
    type: ADD_FRONTPAGE_PLACES,
    places
  };
}

export function fetchPlaces () {
  return dispatch => {
    return callApi('places').then(res => {
      dispatch(addPlaces(res.places));
    });
  };
}

export function fetchFrontpagePlaces () {
  return dispatch => {
    return callApi('placesfrontpage').then(res => {
      dispatch(addFrontpagePlaces(res.places));
    });
  };
}

export function fetchPlace (name) {
  return dispatch => {
    return callApi(`places/${name}`).then(res => {
      if (res.place) {
        return dispatch(addPlace(res.place))
      }
    });
  };
}

export function fetchNewSelectedPlace (name) {
  return dispatch => {
    dispatch(toggleSelectedLoading(true));

    return callApi(`placesselected/${name}`).then(res => {
      return dispatch(addSelectedPlace({ place: res.place, snapshots: res.snapshots }))
    });
  };
}

export function deletePlace (cuid) {
  return {
    type: DELETE_PLACE,
    cuid
  };
}

export function deletePlaceRequest (cuid) {
  return dispatch => {
    return callApi(`places/${cuid}`, 'delete').then(() => dispatch(deletePlace(cuid)));
  };
}