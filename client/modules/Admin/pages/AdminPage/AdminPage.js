import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Helmet from 'react-helmet';

import Header from '../../../App/components/Header/Header';

import styles from './AdminPage.css';

export class AdminPage extends Component {
  render () {
    return (
      <div>
        <Helmet title="Admin" />
        <div>
          <Header>Admin</Header>
          <ul className={styles['list']}>
            <li><Link to='/admin/places'>Places</Link></li>
          </ul>
        </div>
      </div>
    );
  }
}

AdminPage.PropTypes = {
  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired
};

AdminPage.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps (state) {
  return {
    intl: state.intl
  };
}

export default connect(mapStateToProps)(AdminPage);
