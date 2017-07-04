import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import withRedux from 'next-redux-wrapper';

import initStore from '../store';

import Layout from '../modules/layout';

export class B extends Component {
  render () {
    return (
      <Layout>
        <div>Page B</div>
      </Layout>
    );
  }
}

export default withRedux(initStore)(B);
