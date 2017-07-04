import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import AsyncLink from '../AsyncLink';
import Header from '../header';

import {
    Wrapper,
    Menu,
    MenuItem,
    Content
} from './styles';

export default class Layout extends Component {

  static propTypes = {
    children: PropTypes.any
  }

  render () {
    return (
        <Wrapper>
            <Header>
                <Menu>
                    <MenuItem><AsyncLink href='/'>Home</AsyncLink></MenuItem>
                    <MenuItem><AsyncLink href='/a'>a</AsyncLink></MenuItem>
                    <MenuItem><AsyncLink href='/aa'>aa</AsyncLink></MenuItem>
                    <MenuItem><AsyncLink href='/b'>b</AsyncLink></MenuItem>
                    <MenuItem><Link href='/b' as='/bb'><a>bb</a></Link></MenuItem>
                </Menu>
            </Header>
            <Content>
                {this.props.children}
            </Content>
        </Wrapper>
    )
  }
}
