import React from 'react';
import styled from 'styled-components';
import Image, { getImageProps } from 'next/image';

import { prettyDateTime } from 'core/date';

const StyledImage = styled(Image)`
  object-fit: contain;
  width: 100%;
  height: auto;
`;

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
  ...rest
}) => {
  return (
    <StyledImage
      alt={`Bilde fra ${placeName} tatt ${prettyDateTime(date)}`}
      src={image}
      // src={
      //   image.replace('d31r10omfuzino.cloudfront.net', 'vaerhona.imgix.net') +
      //   '?auto=format,enhance'
      // }
      width={width}
      height={height}
      {...rest}
    />
  );
};

export default SnapshotImage;
