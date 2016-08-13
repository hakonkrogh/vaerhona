import { ADD_SNAPSHOT, ADD_SNAPSHOTS, DELETE_SNAPSHOT } from './SnapshotActions';

// Initial State
const initialState = { data: [], selected: false };

const SnapshotReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_SNAPSHOT :
      return {
        data: [action.snapshot, ...state.data],
        selected: action.snapshot
      };

    case ADD_SNAPSHOTS :
      return {
        data: action.snapshots,
        selected: !state.selected ? action.snapshots[action.snapshots.length - 1] : state.selected
      };

    case DELETE_SNAPSHOT :
      let newListOfSnapshots = state.data.filter(snapshot => snapshot.cuid !== action.cuid);
      let selected = state.selected;

      // We are deleting the selected one. Select the last one in the reduced list
      if (state.selected && state.selected.cuid === action.cuid) {
        if (newListOfSnapshots.length > 0) {
          selected = newListOfSnapshots[newListOfSnapshots.length - 1];
        }
        else {
          selected = initialState.selected;
        }
      }

      return {
        data: newListOfSnapshots,
        selected
      };

    default:
      return state;
  }
};

/* Selectors */

// Get all snapshots
export const getSnapshots = state => state.snapshots.data;

// Get selected snapshot
export const getSelectedSnapshot = state => state.snapshots.selected;

// Get snapshot by cuid
export const getSnapshot = (state, cuid) => state.snapshots.data.filter(snapshot => snapshot.cuid === cuid)[0];

// Export Reducer
export default SnapshotReducer;
