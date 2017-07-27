import React, { Component } from 'react';
import Head from 'next/head';

import storeInitializer from '../modules/common/store-initializer';
import { setAppTitle } from '../store/app/reducer';

import api from '../isomorphic/api';
import CommonWrapper from '../modules/common/wrapper';
import Layout from '../modules/layout';
import PlaceList from '../modules/place-list';

export class Index extends Component {
  static async getInitialProps ({ store }) {
    let data;
    let error;

    store.dispatch(setAppTitle(null));

    try {
      data = await api.getFrontpage();
    } catch (e) {
      error = e;
    }
    
    return {
      data,
      error
    };
  }

  render () {
    return (
      <CommonWrapper>
        <Layout>
          <Head>
            <title>Værhøna.no</title>
          </Head>
          <PlaceList data={this.props.data} />
        </Layout>
      </CommonWrapper>
    );
  }
}

export default storeInitializer(Index);
