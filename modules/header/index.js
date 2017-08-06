import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Link from 'next/link';

import { Wrapper, AppIcon } from './ui';

export class Header extends Component {
  render () {
    return (
      <Wrapper>
        <Link as='/' href='/index'><a><AppIcon /></a></Link>
        <span>{this.props.headerTitle}</span>
        {this.props.children}
      </Wrapper>
    );
  }
}

// export default connect(state => state.app)(Header);
export default Header;
