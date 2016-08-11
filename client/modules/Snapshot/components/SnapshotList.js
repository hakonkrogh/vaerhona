import React, { PropTypes } from 'react';

// Import Components
import SnapshotListItem from './SnapshotListItem/SnapshotListItem';

function SnapshotList(props) {
  return (
    <div className="listView">
      {
        props.snapshots.map(snapshot => (
          <SnapshotListItem
            snapshot={snapshot}
            key={snapshot.cuid}
            onDelete={() => props.handleDeleteSnapshot(snapshot.cuid)}
          />
        ))
      }
    </div>
  );
}

SnapshotList.propTypes = {
  snapshots: PropTypes.arrayOf(PropTypes.shape({
    placeCuid: PropTypes.string.isRequired,
    temperature: PropTypes.number.isRequired,
    humidity: PropTypes.number.isRequired,
    pressure: PropTypes.number.isRequired,
  })).isRequired,
  handleDeleteSnapshot: PropTypes.func.isRequired,
};

export default SnapshotList;
