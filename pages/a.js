import React, { Component } from 'react';

import storeInitializer from '../modules/common/store-initializer';
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

export default storeInitializer(A);
