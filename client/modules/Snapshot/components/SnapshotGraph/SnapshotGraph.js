import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import c3 from 'c3';

class SnapshotGraph extends Component {

  componentDidMount () {
    if (typeof document !== 'undefined') {
      console.log('did mount...', this.refs.outer);
    }
  }

  render() {
    return (
      <div className='snapshot-graph' ref='outer'>
      	<div>Loading</div>
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