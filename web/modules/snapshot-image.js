import React, { ViewTransition } from 'react';
import Image, { getImageProps } from 'next/image';

import { prettyDateTime } from 'core/date';
import { getLoadedPhoto, rememberLoadedPhoto } from 'core/page-transition';

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
  transitionName,
  onLoad,
  ...rest
}) => {
  // A size of this photo that has loaded already, shown behind the photo
  // until its own size has loaded. It also gives the photo's real shape, so
  // the box is right from the start. Only set after a page change in the
  // browser, never on the server.
  const loaded = getLoadedPhoto(image);

  const photo = (
    <Image
      alt={`Bilde fra ${placeName} tatt ${prettyDateTime(date)}`}
      src={image}
      // src={
      //   image.replace('d31r10omfuzino.cloudfront.net', 'vaerhona.imgix.net') +
      //   '?auto=format,enhance'
      // }
      width={loaded?.width ?? width}
      height={loaded?.height ?? height}
      {...rest}
      className={className ? `${styles.image} ${className}` : styles.image}
      style={
        loaded && {
          backgroundImage: `url("${loaded.src}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      }
      onLoad={(event) => {
        rememberLoadedPhoto(image, event.currentTarget);
        onLoad?.(event);
      }}
    />
  );

  // With a name, the photo moves to the photo with the same name on the
  // next page. On its own it does not animate.
  return (
    <ViewTransition name={transitionName} default="none" share="auto">
      {photo}
    </ViewTransition>
  );
};

export default SnapshotImage;
