import React from 'react';
import styled, { css } from 'styled-components';

const Svg = styled.svg`
  ${(p) =>
    p.$left &&
    css`
      transform: rotate(180deg);
    `};
`;

export const IconArrow = ({ size = 24, left, ...rest }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" $left={left} {...rest}>
      <path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z" />
    </Svg>
  );
};
