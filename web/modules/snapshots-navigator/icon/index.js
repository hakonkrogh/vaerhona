import React, { Component } from 'react';

import styles from './icon.module.css';

import {
  Picture,
  Statistics,
  Thermometer,
  Droplets,
  Compass,
} from '../../icons';

export default class Icon extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick(e, ...rest) {
    e.preventDefault();
    if (this.props.onClick) {
      this.props.onClick(e, ...rest);
    }
  }

  render() {
    let icon;
    let fillColor = this.props.selected ? '#00628B' : '#000000';

    switch (this.props.type) {
      case 'image':
        icon = <Picture fill={fillColor} />;
        break;

      case 'image-compare':
        icon = (
          <span className={styles.imageCompare} style={{ color: fillColor }}>
            <Picture fill={fillColor} />
          </span>
        );
        break;

      case 'graph':
        icon = <Statistics fill={fillColor} />;
        break;

      case 'thermometer':
        icon = <Thermometer fill={fillColor} />;
        break;

      case 'droplets':
        icon = <Droplets fill={fillColor} />;
        break;

      case 'compass':
        icon = <Compass fill={fillColor} />;
        break;

      default:
        icon = '?';
    }

    return (
      <div
        className={styles.container}
        onClick={this.onClick}
        onTouchStart={this.onClick}
      >
        {icon}
        {this.props.label ? (
          <div className={styles.label} style={{ color: fillColor }}>
            {this.props.label}
          </div>
        ) : null}
      </div>
    );
  }
}
