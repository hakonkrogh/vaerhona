import React, { Component, PropTypes } from 'react';

import styles from './Icon.css';

// Get the SVG icons
import Picture from '../../../../components/Icons/Picture';
import Statistics from '../../../../components/Icons/Statistics';
import Thermometer from '../../../../components/Icons/Thermometer';
import Droplets from '../../../../components/Icons/Droplets';
import Compass from '../../../../components/Icons/Compass';

export default class Icon extends Component {
  render () {

    let icon;
    let fillColor = this.props.selected ? '#00628B' : '#000000';

    switch (this.props.type) {
      case 'image':
        icon = (<Picture fill={fillColor} />);
        break;

      case 'graph':
        icon = (<Statistics fill={fillColor} />);
        break;

      case 'thermometer':
        icon = (<Thermometer fill={fillColor} />);
        break;

      case 'droplets':
        icon = (<Droplets fill={fillColor} />);
        break;

      case 'compass':
        icon = (<Compass fill={fillColor} />);
        break;

      default:
        icon = '?';
    }

    return (
      <div
        className={styles['container'] + ' ' + (this.props.selected ? styles['container--selected'] : '')}
        onClick={this.props.onClick}
        aria-title={this.props.type}
      >
        {icon}
        {this.props.label ? <div className={styles['label']} style={{ color: fillColor }}>{this.props.label}</div> : null}
      </div>
    );
  }
}

Icon.propTypes = {
  selected: PropTypes.bool.isRequired,
  label: PropTypes.string,
  onClick: PropTypes.func
};