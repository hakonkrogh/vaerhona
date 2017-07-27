import React, { Component } from 'react';
import storeInitializer from '../modules/common/store-initializer';

import Layout from '../modules/layout';

export class Place extends Component {
  render () {
    return (
      <Layout>
        <div>Place page</div>
      </Layout>
    );
  }
}

export default storeInitializer(Place);
