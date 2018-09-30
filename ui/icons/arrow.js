import React from "react";
import styled from "styled-components";
import is from "styled-is";

const Svg = styled.svg`
  ${is("left")`
    transform: rotate(180deg);
  `};
`;

export const IconArrow = ({ size = 24, ...rest }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...rest}>
      <path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z" />
    </Svg>
  );
};
