import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import withRedux from 'next-redux-wrapper';

import initStore from '../store';
import { setAppTitle } from '../store/app/reducer';

import Layout from '../modules/layout';
import api from '../isomorphic/api';

export class A extends Component {
  static async getInitialProps ({ store }) {
    const data = await api.getSomeAwesomeData();
    store.dispatch(setAppTitle('test title'));

    return {
      data
    };
  }

  render () {
    return (
      <Layout>
        <div>Page A</div>
        <h1>Async remote title: {this.props.data.title}</h1>
        <div>Async remote data: {this.props.data.data}</div>
      </Layout>
    );
  }
}

export default withRedux(initStore)(A);
