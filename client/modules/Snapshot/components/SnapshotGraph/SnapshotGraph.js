import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class SnapshotGraph extends Component {
  render() {
    return (
      <div className="snapshot-graph">
      	graph...
      </div>
    );
  }
}

SnapshotGraph.propTypes = {
  snapshots: PropTypes.arrayOf(PropTypes.shape({
    cuid: PropTypes.string.isRequired,
    temperature: PropTypes.number.isRequired,
    humidity: PropTypes.number.isRequired,
    pressure: PropTypes.number.isRequired
  })).isRequired,
  dispatch: PropTypes.func.isRequired
};

function mapStateToProps (state) {
  return {};
}

export default connect(mapStateToProps)(SnapshotGraph);