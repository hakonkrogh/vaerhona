import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import Helmet from 'react-helmet';

import { switchLanguage } from '../../../Intl/IntlActions';

import styles from './SettingsPage.css';

export class SettingsPage extends Component {

	switchLanguage (lang) {
		this.props.dispatch(switchLanguage(lang));
	}

  render () {

  	const languageNodes = this.props.intl.enabledLanguages.map(
      lang => <li key={lang} onClick={() => this.switchLanguage(lang)} className={styles['flag-list__item']}>{lang}</li>
    );

    const backLink = `/${this.props.params.placeName}`;

	  return (
	    <div>
	      <Helmet title="Innstillinger" />
	      <div>
	      	<Link to={backLink} ><FormattedMessage id="back" /></Link>
	        
	        <h1><FormattedMessage id="settings" /></h1>

	        <FormattedMessage id="switchLanguage" />
	        <ul className={styles['flag-list']}>
	        	{languageNodes}
	        </ul>
	      </div>
	    </div>
	  );
	}
}

SettingsPage.PropTypes = {
  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired
};

SettingsPage.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps (state) {
  return {
    intl: state.intl
  };
}

export default connect(mapStateToProps)(SettingsPage);
