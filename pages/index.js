import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';

import pageBuilder from '../core/page-builder';
import { setAppTitle } from '../store/app';
import api from '../isomorphic/api';

import CommonWrapper from '../modules/common/wrapper';
import Layout from '../modules/layout';
import { PlaceList } from '../modules/place';

export default pageBuilder({
  category: 'frontpage',
  component: ({ data }) => (
    <CommonWrapper>
      <Layout>
        <Head>
          <title>Værhøna</title>
        </Head>
        {data && <PlaceList data={data} />}
      </Layout>
    </CommonWrapper>
  ),
  getInitialProps: async ({ store, dispatch }) => {
    store.dispatch(setAppTitle(null));

    const data = await api.getFrontpage();

    return { data };
  }
});
