export const initialState = {
  cuid: null,
  name: ''
};

export const actionTypes = Object.freeze({
  PLACE_SET: 'PLACE_SET'
});

export const setPlace = place => ({ type: actionTypes.PLACE_SET, place });

export default function reducer (state = initialState, action) {
  switch (action.type) {
    case actionTypes.PLACE_SET:
      return {
          ...state,
          ...action.place
      };
    default: return state
  }
}
