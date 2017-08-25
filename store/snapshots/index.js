export const initialState = {
  selected: null,
  data: []
};

export const actionTypes = Object.freeze({
  SNAPSHOTS_SET: 'SNAPSHOTS_SET',
  SNAPSHOTS_SHOW_PREV_SNAPSHOT: 'SNAPSHOTS_SHOW_PREV_SNAPSHOT',
  SNAPSHOTS_SHOW_NEXT_SNAPSHOT: 'SNAPSHOTS_SHOW_NEXT_SNAPSHOT',
  SNAPSHOTS_SHOW_SNAPSHOT_FROM_INDEX: 'SNAPSHOTS_SHOW_SNAPSHOT_FROM_INDEX'
});

export const setSnapshots = (snapshots = []) => ({ type: actionTypes.SNAPSHOTS_SET, snapshots });
export const showPrevSnapshot = () => ({ type: actionTypes.SNAPSHOTS_SHOW_PREV_SNAPSHOT });
export const showNextSnapshot = () => ({ type: actionTypes.SNAPSHOTS_SHOW_NEXT_SNAPSHOT });
export const showSnapshotFromIndex = index => ({ type: actionTypes.SNAPSHOTS_SHOW_SNAPSHOT_FROM_INDEX, index });

const getSelectedIndex = s => s.selected ? s.data.findIndex(snapshot => snapshot.cuid === s.selected.cuid) : -1;

// Actions
export const getAdjecentsSnapshots = (state) => {

  if (!state.snapshots.selected) {
    return [];
  }

  const indexSelected = getSelectedIndex(state);

  if (indexSelected === -1) {
    return [];
  }

  return [
    state.snapshots.data[indexSelected - 2],
    state.snapshots.data[indexSelected - 1],
    state.snapshots.data[indexSelected + 1],
    state.snapshots.data[indexSelected + 2]
  ];
}

export default function reducer (state = initialState, action) {
  switch (action.type) {
    case actionTypes.SNAPSHOTS_SET: {
      return {
          ...state,
          selected: action.snapshots[action.snapshots.length - 1],
          data: action.snapshots
      };
    }
    case actionTypes.SNAPSHOTS_SHOW_PREV_SNAPSHOT:
    case actionTypes.SNAPSHOTS_SHOW_NEXT_SNAPSHOT: {
    
      if (!state.selected) {
        return state;
      }

      let index = getSelectedIndex(state);

      index += action.type === actionTypes.SNAPSHOTS_SHOW_PREV_SNAPSHOT ? -1 : 1;
      
      if (index < 0 || index > state.data.length - 1) {
        return state;
      }

      return {
        ...state,
        selected: state.data[index]
      };
    }
    case actionTypes.SNAPSHOTS_SHOW_SNAPSHOT_FROM_INDEX: {
    
      if (!state.selected) {
        return state;
      }

      const { index } = action;

      if (index < 0 || index > state.data.length - 1) {
        return state;
      }

      return {
        ...state,
        selected: state.data[index]
      };
    }
    default: return state
  }
}
