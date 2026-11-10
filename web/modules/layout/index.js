import React, { Component } from 'react';
import Head from 'next/head';

import { Spinner } from 'ui';
import Header from '../header';
import styles from './layout.module.css';

export default class Layout extends Component {
  render() {
    const { loading, title } = this.props;

    return (
      <div className={styles.wrapper}>
        <Head>
          <title>{loading ? 'Henter...' : title}</title>
        </Head>
        <Header title={title} />
        {loading ? (
          <div className={styles.loading}>
            <Spinner size="50px" />
          </div>
        ) : (
          this.props.children
        )}
      </div>
    );
  }
}
