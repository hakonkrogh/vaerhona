export const initialState = {
  id: null,
  name: '',
  snapshots: []
};

export const actionTypes = Object.freeze({
  PLACE_SET_SELECTED: 'PLACE_SET_SELECTED'
});

export const setSelected = (title) => {
  return { type: actionTypes.PLACE_SET_SELECTED, place };
}

export default function reducer (state = initialState, action) {
  switch (action.type) {
    case actionTypes.PLACE_SET_SELECTED:
      return {
          ...state,
          id: action.id,
          name: action.name
      };
    default: return state
  }
}