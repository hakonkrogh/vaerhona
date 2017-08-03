export const MAIN_NAVIGATION_ITEMS = ['image', 'graph'];

export const initialState = {
  headerTitle: '',
  mainNavigation: MAIN_NAVIGATION_ITEMS[0]
};

export const actionTypes = Object.freeze({
  APP_SET_TITLE: 'APP_SET_TITLE',
  CHANGE_MAIN_NAVIGATION: 'CHANGE_MAIN_NAVIGATION'
});

export const setAppTitle = title => ({ type: actionTypes.APP_SET_TITLE, title });
export const changeMainNavigation = name => ({ type: actionTypes.CHANGE_MAIN_NAVIGATION, name });

export default function reducer (state = initialState, action) {
  switch (action.type) {
    case actionTypes.APP_SET_TITLE:
      return {
          ...state,
          headerTitle: action.title
      };
    case actionTypes.CHANGE_MAIN_NAVIGATION:
      if (MAIN_NAVIGATION_ITEMS.includes(action.name)) {
        return {
          ...state,
          mainNavigation: action.name
        };
      }
      return state;
    default: return state
  }
}
