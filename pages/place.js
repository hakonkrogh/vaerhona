import React, { Component } from 'react';
import storeInitializer from '../modules/common/store-initializer';

import Layout from '../modules/layout';
import CommonWrapper from '../modules/common/wrapper';
import api from '../isomorphic/api';

import { setPlace } from '../store/place';
import { setSnapshots } from '../store/snapshots';

import { SnapshotsNavigator } from '../modules/snapshot';

export class Place extends Component {
  static async getInitialProps ({ query, asPath, store }) {
    let props = {};

    try {
      props = await api.getSnapshotsAndPlace((asPath || query.placeName).replace('/', ''));
      store.dispatch(setPlace(props.place));
      store.dispatch(setSnapshots(props.snapshots));
    } catch (e) {
      console.error('error', e);
    }
    return props;
  }

  render () {
    return (
      <CommonWrapper>
        <Layout>
          <SnapshotsNavigator />
        </Layout>
      </CommonWrapper>
    );
  }
}

export default storeInitializer(Place);
