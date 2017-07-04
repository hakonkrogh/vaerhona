import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import { Wrapper, AppIcon } from './styles';

export class Header extends Component {
  render () {
    return (
      <Wrapper>
        <AppIcon />
        <span>{this.props.headerTitle}</span>
        {this.props.children}
      </Wrapper>
    );
  }
}

export default connect(state => state)(Header);
