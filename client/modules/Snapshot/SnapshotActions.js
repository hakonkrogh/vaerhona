import callApi from '../../util/apiCaller';

// Export Constants
export const ADD_SNAPSHOT = 'ADD_SNAPSHOT';
export const ADD_SNAPSHOTS = 'ADD_SNAPSHOTS';
export const DELETE_SNAPSHOT = 'DELETE_SNAPSHOT';

// Export Actions
export function addSnapshot(snapshot) {
  return {
    type: ADD_SNAPSHOT,
    snapshot,
  };
}

export function addSnapshotRequest(snapshot) {
  return (dispatch) => {
    return callApi('snapshots', 'post', {
      snapshot: {
        placeCuid: snapshot.placeCuid,
        temperature: snapshot.temperature,
        pressure: snapshot.pressure,
        humidity: snapshot.humidity,
        dateAdded: snapshot.dateAdded,
      },
    }).then(res => dispatch(addSnapshot(res.snapshot)));
  };
}

export function addSnapshots(snapshots) {
  return {
    type: ADD_SNAPSHOTS,
    snapshots,
  };
}

export function fetchSnapshots() {
  return (dispatch) => {
    return callApi('snapshots').then(res => {
      dispatch(addSnapshots(res.snapshots));
    });
  };
}

export function fetchSnapshot(cuid) {
  return (dispatch) => {
    return callApi(`snapshots/${cuid}`).then(res => dispatch(addSnapshot(res.snapshot)));
  };
}

export function deleteSnapshot(cuid) {
  return {
    type: DELETE_SNAPSHOT,
    cuid,
  };
}

export function deleteSnapshotRequest(cuid) {
  return (dispatch) => {
    return callApi(`snapshots/${cuid}`, 'delete').then(() => dispatch(deleteSnapshot(cuid)));
  };
}
