import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import withRedux from 'next-redux-wrapper';

import initStore from '../store';
import { setAppTitle } from '../store/app/reducer';

import Layout from '../modules/layout';

export class Index extends Component {
  static async getInitialProps ({ store }) {
    store.dispatch(setAppTitle('Select place page'));
    return {};
  }

  render () {
    return (
      <Layout>
        Select place page
      </Layout>
    );
  }
}

export default withRedux(initStore)(Index);
