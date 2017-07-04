export const initialState = {
  headerTitle: ''
};

export const actionTypes = Object.freeze({
  APP_SET_TITLE: 'APP_SET_TITLE'
});

export const setAppTitle = (title) => dispatch => {
  return dispatch({ type: actionTypes.APP_SET_TITLE, title });
}

export default function reducer (state = initialState, action) {
  switch (action.type) {
    case actionTypes.APP_SET_TITLE:
      return {
          ...state,
          headerTitle: action.title
      };
    default: return state
  }
}