import React from 'react';

import { prettyDateTime } from 'core/date';

// All the possible image variations
const imageSizeVariations = [100, 320, 640, 1024, 1280];

const SnapshotImage = ({ date, placeName, image, sizes, ...rest }) => {
  const props = {
    alt: `Bilde fra ${placeName} tatt ${prettyDateTime(date)}`,
    ...rest
  };

  props.src = `${image}/${imageSizeVariations[3]}_r`;
  props.srcSet = imageSizeVariations
    .map(size => `${image}/${size}_r ${size}w`)
    .join(', ');

  return <img sizes={sizes} {...props} />;
};

export default SnapshotImage;
