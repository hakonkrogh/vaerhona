import React from 'react';

import pageBuilder from '../core/page-builder';
import CommonWrapper from '../modules/common/wrapper';
import Layout from '../modules/layout';
import { SnapshotsNavigator } from '../modules/snapshot';

import api from '../isomorphic/api';
import { setPlace } from '../store/place';
import { setSnapshots } from '../store/snapshots';

export default pageBuilder({
  component: () => (
    <CommonWrapper>
      <Layout>
        <SnapshotsNavigator />
      </Layout>
    </CommonWrapper>
  ),
  getInitialProps: async ({ query, asPath, store }) => {
    const props = await api.getSnapshotsAndPlace((asPath || query.placeName).replace('/', ''));
    store.dispatch(setPlace(props.place));
    store.dispatch(setSnapshots(props.snapshots));
    return props;
  }
});
