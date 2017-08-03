import React, { Component } from 'react';
import PropTypes from 'prop-types';
 
export default class Icon extends Component {

    static defaultProps = {
      width: '20px',
      height: '20px',
      fill: '#000000'
    }

    static propTypes = {
      width: PropTypes.string,
      height: PropTypes.string,
      fill: PropTypes.string
    }
    
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
          viewBox="0 0 20 20"
        >
          <path
            d="M12.601 9.867v-8.867c0-0.552-0.448-1-1-1h-3.401c-0.553 0-0.8 0.448-0.8 1v8.867c-1.669 0.919-2.8 2.694-2.8 4.733 0 2.982 2.418 5.4 5.4 5.4s5.4-2.418 5.4-5.4c0-2.039-1.131-3.814-2.799-4.733zM10 18c-1.878 0-3.4-1.522-3.4-3.4 0-1.554 1.044-2.86 2.468-3.267v-7.333h2v7.373c1.354 0.448 2.333 1.723 2.333 3.227-0.001 1.878-1.523 3.4-3.401 3.4z"
            fill={fill}
          ></path>
        </svg>
      );
    }
}
