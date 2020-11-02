import React from 'react';
import Image from 'next/image';

import { prettyDateTime } from 'core/date';

const SnapshotImage = ({
  date,
  placeName,
  image,
  width = 1280,
  height = 960,
}) => {
  return (
    <Image
      alt={`Bilde fra ${placeName} tatt ${prettyDateTime(date)}`}
      src={image}
      width={width}
      height={height}
    />
  );
};

export default SnapshotImage;
