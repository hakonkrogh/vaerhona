import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';

// Import Style
import styles from '../../components/SnapshotListItem/SnapshotListItem.css';

// Import Actions
import { fetchSnapshot } from '../../SnapshotActions';

// Import Selectors
import { getSnapshot } from '../../SnapshotReducer';

export function SnapshotDetailPage(props) {
  return (
    <div>
      <Helmet title={props.snapshot.dateAdded} />
      <div className={`${styles['single-post']} ${styles['snapshot-detail']}`}>
        <h3 className={styles['snapshot-title']}>{props.snapshot.dateAdded}</h3>
        <p>Temperature: {props.snapshot.temperature}</p>
        <p>Humidity: {props.snapshot.humidity}</p>
        <p>Pressure: {props.snapshot.pressure}</p>
      </div>
    </div>
  );
}

// Actions required to provide data for this component to render in sever side.
SnapshotDetailPage.need = [params => {
  return fetchSnapshot(params.cuid);
}];

// Retrieve data from store as props
function mapStateToProps(state, props) {
  return {
    post: getSnapshot(state, props.params.cuid),
  };
}

SnapshotDetailPage.propTypes = {
  post: PropTypes.shape({
    placeCuid: PropTypes.string.isRequired,
    temperature: PropTypes.number.isRequired,
    humidity: PropTypes.number.isRequired,
    pressure: PropTypes.number.isRequired,
    cuid: PropTypes.string.isRequired,
  }).isRequired,
};

export default connect(mapStateToProps)(SnapshotDetailPage);
