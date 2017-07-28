import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import AsyncLink from '../AsyncLink';
import { Wrapper, AppIcon } from './ui';

export class Header extends Component {
  render () {
    return (
      <Wrapper>
        <AsyncLink href='/'><AppIcon /></AsyncLink>
        <span>{this.props.headerTitle}</span>
        {this.props.children}
      </Wrapper>
    );
  }
}

// export default connect(state => state.app)(Header);
export default Header;
