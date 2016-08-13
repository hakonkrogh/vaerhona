import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';

import { getSelectedPlace } from '../../AppActions';

// Import Style
import styles from './Header.css';

export class Header extends Component {

  render () {

    const languageNodes = this.props.intl.enabledLanguages.map(
      lang => <li key={lang} onClick={() => this.props.switchLanguage(lang)} className={lang === this.props.intl.locale ? styles.selected : ''}>{lang}</li>
    );

    //const showSettings = this.context.router.isActive(`/${this.props.params.placeName}`);
    //const linkToSettings  = showSettings ? `/${this.props.params.placeName}/settings` : `/`;
   console.log('placeName', this.context.params.placeName);
    const showSettings = !!this.context.params.placeName;
    const linkToSettings = this.context.params.placeName ? `/${this.context.params.placeName}/settings` : `/`;

    return (
      <div className={styles.header}>
        <div className={styles.content}>
          <h1 className={styles['site-title']}>
            <Link to="/" ><FormattedMessage id="siteTitle" /></Link>
          </h1>
          
          {
            showSettings
              ? <Link to={linkToSettings}><FormattedMessage id="settings" /></Link>
              : null
          }
        </div>
      </div>
    );
  }
}

Header.contextTypes = {
  router: React.PropTypes.object,
  params: React.PropTypes.object
};

Header.propTypes = {
  intl: PropTypes.object.isRequired
};

function mapStateToProps (state) {
  return {
    selectedPlace: getSelectedPlace(state)
  };
}

export default connect(mapStateToProps)(Header);