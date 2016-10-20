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
            d="M9.872 0.401c-5.302 0.071-9.542 4.426-9.471 9.727s4.426 9.542 9.728 9.472c5.301-0.072 9.542-4.426 9.471-9.728-0.073-5.302-4.428-9.542-9.728-9.471zM10.101 17.578c-4.185 0.057-7.623-3.291-7.68-7.477-0.055-4.185 3.292-7.623 7.478-7.679 4.185-0.056 7.623 3.291 7.679 7.477s-3.291 7.622-7.477 7.679zM5.453 14.504c0 0 4.569-0.627 6.518-2.576s2.576-6.518 2.576-6.518-4.568 0.628-6.517 2.576c-1.949 1.95-2.577 6.518-2.577 6.518zM9.015 8.972c0.819-0.82 2.385-1.401 3.729-1.762-0.361 1.341-0.945 2.919-1.759 3.732-0.544 0.544-1.426 0.544-1.97 0s-0.545-1.426 0-1.97z"
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