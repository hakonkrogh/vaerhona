import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

// Import Style
import styles from './App.css';

// Import Components
import Helmet from 'react-helmet';
import DevTools from './components/DevTools';
import Header from './components/Header/Header';

// Import Actions
import { switchLanguage } from '../../modules/Intl/IntlActions';

export class App extends Component {
  constructor (props) {
    super(props);
    this.state = { isMounted: false };
  }

  componentDidMount () {
    this.setState({ isMounted: true }); // eslint-disable-line
  }

  getChildContext () {

    // Enable children components to access the params
    return {
      params: this.props.params
    }
  }

  render () {
    return (
      <div>
        {this.state.isMounted && !window.devToolsExtension && process.env.NODE_ENV === 'development' && <DevTools />}
        <div className={styles.container}>
          <Helmet
            title="Værhøna"
            titleTemplate="%s - Værhøna"
            meta={[
              { charset: 'utf-8' },
              {
                'http-equiv': 'X-UA-Compatible',
                content: 'IE=edge'
              },
              {
                name: 'viewport',
                content: 'user-scalable=no, width=device-width, initial-scale=1, maximum-scale=1'
              }
            ]}
          />
          <div>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired
};

// Enable children components to access the params
App.childContextTypes = {
  params: React.PropTypes.object
};

// Retrieve data from state as props
function mapStateToProps (state) {
  return {
    intl: state.intl
  };
}

export default connect(mapStateToProps)(App);
