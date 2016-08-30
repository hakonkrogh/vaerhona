import callApi from '../../util/apiCaller';

// Export Constants
export const ADD_PLACE = 'ADD_PLACE';
export const ADD_PLACES = 'ADD_PLACES';
export const DELETE_PLACE = 'DELETE_PLACE';
export const UNSELECT_PLACE = 'UNSELECT_PLACE';

// Export Actions
export function addPlace (place) {
  return {
    type: ADD_PLACE,
    place
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

export function fetchPlaces () {
  return dispatch => {
    return callApi('places').then(res => {
      dispatch(addPlaces(res.places));
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