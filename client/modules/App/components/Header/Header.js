import React, { PropTypes, Component } from 'react';

// Import Style
import styles from './Header.css';

export class Header extends Component {
  render () {
    return (
      <div className={styles['header']}>
        <div className={styles['header__content']}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default Header;