import {
  ADD_SNAPSHOT,
  ADD_SNAPSHOTS,
  DELETE_SNAPSHOT,
  SHOW_PREV_SNAPSHOT,
  SHOW_NEXT_SNAPSHOT,
  SHOW_SNAPSHOT_FROM_INDEX
} from './SnapshotActions';

import {
  UNSELECT_PLACE,
  ADD_SELECTED_PLACE
} from './../Place/PlaceActions';

// Initial State
const getInitialState = () => {
  return {
    data: [],
    selected: false
  };
};

const SnapshotReducer = (state = getInitialState(), action) => {
  switch (action.type) {
    case ADD_SNAPSHOT: {
      return {
        data: [action.snapshot, ...state.data],
        selected: action.snapshot
      };
    }

    case ADD_SNAPSHOTS: {
      if (action.snapshots && action.snapshots.length) {
        return {
          data: action.snapshots,
          selected: !state.selected && action.snapshots ? action.snapshots[action.snapshots.length - 1] : state.selected
        };
      }

      return {
        data: getInitialState().data,
        selected: getInitialState().data
      };
    }

    case DELETE_SNAPSHOT: {
      let newListOfSnapshots = state.data.filter(snapshot => snapshot.cuid !== action.cuid);
      let selected = state.selected;

      // We are deleting the selected one. Select the last one in the reduced list
      if (state.selected && state.selected.cuid === action.cuid) {
        if (newListOfSnapshots.length > 0) {
          selected = newListOfSnapshots[newListOfSnapshots.length - 1];
        }
        else {
          selected = getInitialState().selected;
        }
      }

      return {
        data: newListOfSnapshots,
        selected
      };
    }

    case SHOW_PREV_SNAPSHOT: {
    
      if (!state.selected) {
        return state;
      }

      let selectedIndex1 = state.data.findIndex((snapshot, index) => snapshot.cuid === state.selected.cuid);
      
      if (selectedIndex1 === 0) {
        return state;
      }

      return {
        data: state.data,
        selected: state.data[selectedIndex1 - 1]
      };
    }

    case SHOW_NEXT_SNAPSHOT : {
    
      if (!state.selected) {
        return state;
      }

      let selectedIndex = state.data.findIndex((snapshot, index) => snapshot.cuid === state.selected.cuid);
      
      if (selectedIndex >= state.data.length - 1) {
        return state;
      }

      return {
        data: state.data,
        selected: state.data[selectedIndex + 1]
      };
    }

    case SHOW_SNAPSHOT_FROM_INDEX: {
    
      if (!state.selected) {
        return state;
      }
      
      return {
        data: state.data,
        selected: state.data[action.index] || state.selected
      };
    }
    
    case UNSELECT_PLACE: {
      return getInitialState();
    }

    case ADD_SELECTED_PLACE : {
      action.snapshots = action.snapshots || [];
      
      return {
        data: action.snapshots,
        selected: action.snapshots[action.snapshots.length - 1]
      };
    }

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
