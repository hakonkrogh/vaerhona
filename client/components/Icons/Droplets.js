import React, { Component, PropTypes } from 'react'
 
export default class Icon extends Component {
    
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
            d="M3.955 0.093c-0.015-0.124-0.22-0.124-0.234 0-0.511 4.115-3.121 4.963-3.121 7.823 0 1.767 1.482 3.199 3.238 3.199s3.238-1.432 3.238-3.199c0-2.86-2.61-3.708-3.121-7.823zM16.279 0.093c-0.016-0.124-0.219-0.124-0.234 0-0.511 4.115-3.121 4.963-3.121 7.823 0 1.767 1.482 3.199 3.238 3.199s3.238-1.432 3.238-3.199c0-2.86-2.61-3.708-3.121-7.823zM9.883 8.978c-0.511 4.115-3.121 4.962-3.121 7.822 0 1.768 1.482 3.2 3.238 3.2s3.238-1.433 3.238-3.2c0-2.859-2.61-3.707-3.121-7.822-0.015-0.125-0.219-0.125-0.234 0z"
            fill={fill}
          ></path>
        </svg>
      );
    }
}

Icon.defaultProps = {
  width: '20px',
  height: '20px',
  fill: '#000000'
};

Icon.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  fill: PropTypes.string
};