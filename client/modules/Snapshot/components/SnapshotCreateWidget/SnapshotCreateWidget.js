import React, { Component, PropTypes } from 'react';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

// Import Style
import styles from './SnapshotCreateWidget.css';

export class SnapshotCreateWidget extends Component {
  addSnapshot = () => {
    const tempRef = this.refs.temperature;
    const humRef = this.refs.humidity;
    const presRef = this.refs.pressure;

    if (tempRef.value && humRef.value && presRef.value) {
      this.props.addSnapshot({
        temperature: tempRef.value,
        humidity: humRef.value,
        pressure: presRef.value
      });
      
      // Reset
      tempRef.value = humRef.value = presRef.value = '';
    }
  };

  render() {
    const cls = `${styles.form} ${(this.props.showAddSnapshot ? styles.appear : '')}`;
    return (
      <div className={cls}>
        <div className={styles['form-content']}>
          <h2 className={styles['form-title']}><FormattedMessage id="createNewSnapshot" /></h2>
          <input placeholder={this.props.intl.messages.temperature} className={styles['form-field']} ref="temperature" />
          <input placeholder={this.props.intl.messages.humidity} className={styles['form-field']} ref="humidity" />
          <input placeholder={this.props.intl.messages.pressure} className={styles['form-field']} ref="pressure" />
          <a className={styles['snapshot-submit-button']} href="#" onClick={this.addSnapshot}><FormattedMessage id="submit" /></a>
        </div>
      </div>
    );
  }
}

SnapshotCreateWidget.propTypes = {
  addSnapshot: PropTypes.func.isRequired,
  showAddSnapshot: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(SnapshotCreateWidget);
