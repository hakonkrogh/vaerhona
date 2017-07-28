import React, { Component } from 'react';
import storeInitializer from '../modules/common/store-initializer';

import Layout from '../modules/layout';
import CommonWrapper from '../modules/common/wrapper';
import api from '../isomorphic/api';

export class Place extends Component {
  static async getInitialProps ({ query, asPath }) {
    let place;

    try {
      const placeName = (asPath || query.placeName).replace('/', '');
      place = await api.getPlace(placeName);
    } catch (e) {
      console.error('error', e);
    }
    return {
      place
    };
  }

  render () {
    const { place = {} } = this.props;
    return (
      <CommonWrapper>
        <Layout>
          <div>{place.name} ({place.cuid})</div>
        </Layout>
      </CommonWrapper>
    );
  }
}

export default storeInitializer(Place);
