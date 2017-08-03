import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import styled from 'styled-components';

import AsyncLink from '../AsyncLink';
import Header from '../header';

const Wrapper = styled.div`
    background: #fcfcfc;
    height: 100vh;
    display: flex;
    flex-direction: column;
`;

export default class Layout extends Component {

  static propTypes = {
    children: PropTypes.any
  }

  render () {
    return (
        <Wrapper>
            <Header />
            {this.props.children}
        </Wrapper>
    )
  }
}
