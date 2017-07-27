import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import withRedux from 'next-redux-wrapper';
import Head from 'next/head';

import initStore from '../store';
import { setAppTitle } from '../store/app/reducer';

import api from '../isomorphic/api';
import Layout from '../modules/layout';
import PlaceList from '../modules/place-list';

export class Index extends Component {
  static async getInitialProps ({ store }) {
    let data;
    let error;
    store.dispatch(setAppTitle('Select place'));

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
      <Layout>
        <Head>
          <title>Select place</title>
        </Head>
        <PlaceList data={this.props.data} />
      </Layout>
    );
  }
}

export default withRedux(initStore)(Index);
