import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';

import { getAbsolutePathForImage } from '../../../../aws/s3';

import styles from './PlacePreviewList.css';

// Each item
class PlacePreviewListItem extends Component {
  render () {

    const imageSrc = getAbsolutePathForImage({
      place: this.props.place,
      snapshot: this.props.snapshot
    });

    return (
      <Link to={`/${this.props.place.name}`} className={styles['place-preview-list__item']}>
        <img src={imageSrc} alt={this.props.place.name} className={styles['place-preview-list__image']} />
        <div>{this.props.place.name}</div>
      </Link>
    );
  }
}

export default class PlacePreviewList extends Component {

  render () {
    return (
      <div className={styles['place-preview-list']}>
        {
          this.props.items.map(item => (<PlacePreviewListItem place={item.place} snapshot={item.snapshot} key={`place-${item.place.cuid}`} />))
        }
      </div>
    );
  }
}

PlacePreviewList.propTypes = {
  items: PropTypes.array.isRequired
};