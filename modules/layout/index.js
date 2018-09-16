import React, { Component } from "react";
import Head from "next/head";
import styled from "styled-components";

import { Spinner } from "ui";
import Header from "../header";

const Wrapper = styled.div`
  background: #fcfcfc;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const Loading = styled.div`
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default class Layout extends Component {
  render() {
    const { loading, title } = this.props;

    return (
      <Wrapper>
        <Head>
          <title>{loading ? "Henter..." : title}</title>
        </Head>
        <Header />
        {loading ? (
          <Loading>
            <Spinner size={50} />
          </Loading>
        ) : (
          this.props.children
        )}
      </Wrapper>
    );
  }
}
