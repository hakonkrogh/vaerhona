import React from 'react';
import styled from 'styled-components';
// import Image from 'next/image';

import { prettyDateTime } from 'core/date';

const StyledImage = styled.img`
  object-fit: contain;
  height: 66dvh;
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
      src={
        image.replace('d31r10omfuzino.cloudfront.net', 'vaerhona.imgix.net') +
        '?auto=format,enhance'
      }
      width={width}
      height={height}
      {...rest}
    />
  );
};

export default SnapshotImage;
