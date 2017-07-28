import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import AsyncLink from '../AsyncLink';
import Header from '../header';

import {
    Wrapper,
    Content
} from './ui';

export default class Layout extends Component {

  static propTypes = {
    children: PropTypes.any
  }

  render () {
    return (
        <Wrapper>
            <Header />
            <Content>
                {this.props.children}
            </Content>
        </Wrapper>
    )
  }
}
