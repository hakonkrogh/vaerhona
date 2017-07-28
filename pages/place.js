import React, { Component } from 'react';
import storeInitializer from '../modules/common/store-initializer';

import Layout from '../modules/layout';
import CommonWrapper from '../modules/common/wrapper';
import api from '../isomorphic/api';

export class Place extends Component {
  static async getInitialProps ({ query, asPath }) {
    let props = {};

    try {
      const placeName = (asPath || query.placeName).replace('/', '');
      props = await api.getSnapshotsAndPlace(placeName);
    } catch (e) {
      console.error('error', e);
    }
    return props;
  }

  render () {
    const { place = {}, snapshots = [{ temperature: '=(' }] } = this.props;

    // if (!place) {
    //   return (
    //     <CommonWrapper>
    //       <Layout>
    //         Error: place is not defined
    //       </Layout>
    //     </CommonWrapper>
    //   );
    // }

    return (
      <CommonWrapper>
        <Layout>
          <div>{place.name} ({place.cuid})</div>
          <div>First snapshot: {snapshots[0].temperature}</div>
        </Layout>
      </CommonWrapper>
    );
  }
}

export default storeInitializer(Place);
