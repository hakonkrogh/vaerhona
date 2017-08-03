import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Container, Label } from './ui';

import {
  Picture,
  Statistics,
  Thermometer,
  Droplets,
  Compass
} from '../../icons';

export default class Icon extends Component {
  static propTypes = {
    selected: PropTypes.bool.isRequired,
    label: PropTypes.string,
    onClick: PropTypes.func
  }

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
      <Container selected={this.props.selected}
        onClick={this.props.onClick}
        onTouchStart={this.props.onClick}
      >
        {icon}
        {this.props.label ? <Label style={{ color: fillColor }}>{this.props.label}</Label> : null}
      </Container>
    );
  }
}
