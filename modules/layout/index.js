import React, { Component } from 'react';
import Head from 'next/head';
import styled from 'styled-components';

import { Spinner } from 'ui';
import Header from '../header';

const Wrapper = styled.div`
  background: #fcfcfc;
`;

export const Loading = styled.div`
  height: 100dvh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default class Layout extends Component {
  render() {
    const { loading, title, scroll } = this.props;

    return (
      <Wrapper scroll={scroll}>
        <Head>
          <title>{loading ? 'Henter...' : title}</title>
        </Head>
        <Header title={title} />
        {loading ? (
          <Loading>
            <Spinner size="50px" />
          </Loading>
        ) : (
          this.props.children
        )}
      </Wrapper>
    );
  }
}
