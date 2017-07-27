import React, { Component } from 'react';
import storeInitializer from '../modules/common/store-initializer';

import Layout from '../modules/layout';

export class B extends Component {
  render () {
    return (
      <Layout>
        <div>Page B</div>
      </Layout>
    );
  }
}

export default storeInitializer(B);
