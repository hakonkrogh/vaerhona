import React, { Component } from 'react';
import Head from 'next/head';

import storeInitializer from '../modules/common/store-initializer';
import { setAppTitle } from '../store/app';

import api from '../isomorphic/api';
import CommonWrapper from '../modules/common/wrapper';
import Layout from '../modules/layout';
import { PlaceList } from '../modules/place';

export class Index extends Component {
  static async getInitialProps ({ store, dispatch }) {
    let data;

    store.dispatch(setAppTitle(null));

    try {
      data = await api.getFrontpage();
    } catch (e) {
      console.error(e);
    }
    
    return {
      data
    };
  }

  render () {
    const { data } = this.props;

    return (
      <CommonWrapper>
        <Layout>
          <Head>
            <title>Værhøna.no</title>
          </Head>
          {data && <PlaceList data={data} />}
        </Layout>
      </CommonWrapper>
    );
  }
}

export default storeInitializer(Index);
