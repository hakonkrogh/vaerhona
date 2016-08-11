import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { getAbsolutePathForImage } from '../../../../../shared/aws/s3';
import { getSelectedPlace } from '../../../App/AppActions';

// Import Style
import styles from './SnapshotListItem.css';

function SnapshotListItem(props) {
  return (
    <div className={styles['single-snapshot']}>
      <h3 className={styles['snapshot-title']}>
        <Link to={`/snapshots/${props.snapshot.cuid}`} >
          {props.snapshot.dateAdded}
        </Link>
      </h3>
      <img src={getAbsolutePathForImage({ place: props.place, snapshot: props.snapshot })} className={styles['snapshot-image']} />
      <p>{props.snapshot.temperature} {props.snapshot.humidity} {props.snapshot.pressure}</p>
      <p className={styles['snapshot-action']}><a href="#" onClick={props.onDelete}><FormattedMessage id="deleteSnapshot" /></a></p>
      <hr className={styles.divider} />
    </div>
  );
}

SnapshotListItem.propTypes = {
  place: PropTypes.shape({
    name: PropTypes.string.isRequired,
    cuid: PropTypes.string
  }),
  snapshot: PropTypes.shape({
    placeCuid: PropTypes.string.isRequired,
    temperature: PropTypes.number.isRequired,
    humidity: PropTypes.number.isRequired,
    pressure: PropTypes.number.isRequired,
    cuid: PropTypes.string.isRequired
  }).isRequired,
  onDelete: PropTypes.func.isRequired
};

// Retrieve data from store as props
function mapStateToProps (state) {
  return {
    place: getSelectedPlace(state)
  };
}

export default connect(mapStateToProps)(SnapshotListItem);