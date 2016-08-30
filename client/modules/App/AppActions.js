// Export Constants
export const TOGGLE_ADD_SNAPSHOT = 'TOGGLE_ADD_SNAPSHOT';
export const CHANGE_MAIN_NAVIGATION = 'CHANGE_MAIN_NAVIGATION';

export const MAIN_NAVIGATION_ITEMS = ['image', 'graph'];

// Ensure that you cannot modify the main navigation items
Object.freeze(MAIN_NAVIGATION_ITEMS);

// Export Actions
export function toggleAddSnapshot () {
  return {
    type: TOGGLE_ADD_SNAPSHOT
  };
}

export function changeMainNavigation (newNavigationName) {
  return {
    type: CHANGE_MAIN_NAVIGATION,
    name: newNavigationName
  };
}