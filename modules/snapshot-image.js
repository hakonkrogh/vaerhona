import React from 'react';
import styled from 'styled-components';
import Image from 'next/image';

import { prettyDateTime } from 'core/date';

const StyledImage = styled(Image)`
  object-fit: contain;
  width: 100%;
  height: auto;
`;

const SnapshotImage = ({
  date,
  placeName,
  image,
  width = 1280,
  height = 960,
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
