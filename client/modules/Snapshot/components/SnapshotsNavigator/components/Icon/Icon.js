import React, { Component, PropTypes } from 'react';

import styles from './Icon.css';

// Get the SVG icons
import Picture from '../../../../../App/components/Icons/Picture';
import Statistics from '../../../../../App/components/Icons/Statistics';

export default class Icon extends Component {
  render () {

    let icon;
    let fill = this.props.selected ? '#4878dc' : '#000000';

    switch (this.props.type) {
      case 'image':
        icon = (<Picture fill={fill} />);
        break;

      case 'graph':
        icon = (<Statistics fill={fill} />);
        break;

      default:
        icon = '?';
    }

    return (
      <div
        className={styles['container'] + ' ' + (this.props.selected ? styles['container--selected'] : '')}
        onClick={this.props.onClick}
        aria-title={this.props.type}
      >{icon}</div>
    );
  }
}

Icon.propTypes = {
  selected: PropTypes.bool.isRequired,
  onClick: PropTypes.func
};