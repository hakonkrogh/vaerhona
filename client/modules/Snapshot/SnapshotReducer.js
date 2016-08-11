import { ADD_SNAPSHOT, ADD_SNAPSHOTS, DELETE_SNAPSHOT } from './SnapshotActions';

// Initial State
const initialState = { data: [] };

const SnapshotReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_SNAPSHOT :
      return {
        data: [action.snapshot, ...state.data],
      };

    case ADD_SNAPSHOTS :
      return {
        data: action.snapshots,
      };

    case DELETE_SNAPSHOT :
      return {
        data: state.data.filter(snapshot => snapshot.cuid !== action.cuid),
      };

    default:
      return state;
  }
};

/* Selectors */

// Get all snapshots
export const getSnapshots = state => state.snapshots.data;

// Get snapshot by cuid
export const getSnapshot = (state, cuid) => state.snapshots.data.filter(snapshot => snapshot.cuid === cuid)[0];

// Export Reducer
export default SnapshotReducer;
