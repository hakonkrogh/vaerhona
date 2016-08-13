import React, { Component } from 'react';

class SnapshotDisplayChooser extends Component {
  render() {
    return (
      <div>
        <div className="snapshot-display-chooser">
        {this.props.children}
        </div>
      </div>
    );
  }
}

export default SnapshotDisplayChooser;