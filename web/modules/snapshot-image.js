import React from 'react';
import Image, { getImageProps } from 'next/image';

import { prettyDateTime } from 'core/date';

import styles from './snapshot-image.module.css';

// The size of a snapshot photo.
const WIDTH = 1280;
const HEIGHT = 960;

/**
 * The image attributes SnapshotImage gives the browser, so a photo can be
 * loaded ahead with the same URL the browser will pick for it.
 */
export function getSnapshotImageProps({ image, sizes }) {
  return getImageProps({
    src: image,
    width: WIDTH,
    height: HEIGHT,
    sizes,
    alt: '',
  }).props;
}

const SnapshotImage = ({
  date,
  placeName,
  image,
  width = WIDTH,
  height = HEIGHT,
  className,
  ...rest
}) => {
  return (
    <Image
      alt={`Bilde fra ${placeName} tatt ${prettyDateTime(date)}`}
      src={image}
      // src={
      //   image.replace('d31r10omfuzino.cloudfront.net', 'vaerhona.imgix.net') +
      //   '?auto=format,enhance'
      // }
      width={width}
      height={height}
      {...rest}
      className={className ? `${styles.image} ${className}` : styles.image}
    />
  );
};

export default SnapshotImage;
