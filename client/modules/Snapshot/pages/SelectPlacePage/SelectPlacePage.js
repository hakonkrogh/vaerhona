import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';

// Import Style
//import styles from '../../components/SnapshotListItem/SnapshotListItem.css';
export function SelectPlacePage (props) {
  return (
    <div>
      <Helmet title="Velg værhøne" />
      <div>
        Skriv inn navn på værhøne:
      </div>
    </div>
  );
}

// Actions required to provide data for this component to render in sever side.
//SnapshotDetailPage.need = [params => {
//  return fetchSnapshot(params.cuid);
//}];

// Retrieve data from store as props
function mapStateToProps(state, props) {
  return {};
}

//SnapshotDetailPage.propTypes = {
//  post: PropTypes.shape({
//    placeCuid: PropTypes.string.isRequired,
//    temperature: PropTypes.number.isRequired,
//    humidity: PropTypes.number.isRequired,
//    pressure: PropTypes.number.isRequired,
//    cuid: PropTypes.string.isRequired,
//  }).isRequired,
//};

export default connect(mapStateToProps)(SelectPlacePage);
