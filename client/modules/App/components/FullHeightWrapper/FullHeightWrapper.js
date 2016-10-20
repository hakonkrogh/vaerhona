import React, { Component } from 'react';

import styles from './FullHeightWrapper.css';

export default class FullHeightWrapper extends Component {

  render () {
    return (
      <div className={styles.container}>{this.props.children}</div>
    );
  }
}