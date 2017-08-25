import React, { Component } from 'react';
import PropTypes from 'prop-types';
 
export default class Icon extends Component {

    static defaultProps = {
      width: '22px',
      height: '22px',
      fill: '#000000'
    };

    static propTypes = {
      width: PropTypes.string,
      height: PropTypes.string,
      fill: PropTypes.string
    };
    
    render () {

      const { width, height, fill } = this.props;

      const style = {
        width,
        height
      };

      return (
        <svg
          version="1.1"
          style={style}
          viewBox="0 0 22 22"
        >
          <path
            d="M20 22h-18c-1.104 0-2-0.896-2-2v-18c0-1.104 0.896-2 2-2h18c1.104 0 2 0.896 2 2v18c0 1.104-0.896 2-2 2zM20 2h-18v18h18v-18zM10 15l3-4 5 7h-14l4-5 2 2zM8 9c-1.104 0-2-0.896-2-2s0.896-2 2-2 2 0.896 2 2-0.896 2-2 2z"
            fill={fill}
          ></path>
        </svg>
      );
    }
}
