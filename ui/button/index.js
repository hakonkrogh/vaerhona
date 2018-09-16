import React from "react";
import styled from "styled-components";
import is, { isNot } from "styled-is";
import { lighten } from "polished";

import { Spinner } from "../spinner";

import preventDoubleTapZoom from "./preventDoubleTapZoom";

const themes = {
  primary: {
    default: `
      background: #888;
      color: #fff;
      text-decoration: none;
      text-align: center;
    `,
    hover: `
      background: #999;
    `,
    disabled: `
      background: #aaa;
      color: #333;
    `
  },
  clean: {
    default: ``,
    hover: ``,
    disabled: ``
  },
  danger: {
    default: `
      background: red;
      color: #fff;
      text-decoration: none;
      text-align: center;
    `,
    hover: `
      background: ${lighten(0.05, "red")};
    `,
    disabled: `
      background: #aaa;
      color: #333;
    `
  }
};

function getTheme(rest) {
  const themeNames = Object.keys(themes);
  for (let i = 0; i < themeNames.length; i++) {
    if (themeNames[i] in rest) {
      return themes[themeNames[i]];
    }
  }

  return themes.primary;
}

const sizes = {
  tiny: {
    padding: "0px 1px",
    minWidth: "0"
  },
  small: {
    padding: "5px 10px",
    minWidth: "0"
  },
  medium: {
    padding: "10px 15px"
  },
  large: {
    padding: "0px 1px",
    minWidth: "0"
  },
  xlarge: {
    padding: "0px 1px",
    minWidth: "0"
  }
};

function getSize({ tiny, small, large, xlarge }) {
  if (tiny) {
    return sizes.tiny;
  }
  if (small) {
    return sizes.small;
  }
  if (large) {
    return sizes.large;
  }
  if (xlarge) {
    return sizes.xlarge;
  }
  return sizes.medium;
}

const ButtonInner = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: ${p => p.size.minWidth};
  padding: ${p => p.size.padding};
  padding: ${p => p.size.padding};
  font-size: ${p => p.size.fontSize || "inherit"};
  transition: background-color 100ms;
  position: relative;
  ${p => (p.theme ? p.theme.default : "")};
`;

const ButtonOuter = styled.button`
  display: ${p => (p.block ? "block" : "inline-block")};
  border-radius: 0;
  border: none;
  padding: 0;
  appearance: none;
  cursor: pointer;
  text-decoration: none;

  &:hover ${ButtonInner} {
    ${({ theme }) => (theme ? theme.hover : ``)};
  }

  &[disabled] {
    cursor: default;

    ${ButtonInner} {
      ${({ theme }) => (theme ? theme.disabled : ``)};
    }
  }
`;

const ButtonText = styled.span`
  position: relative;
  z-index: 2;
  transition: opacity 100ms, transform 100ms;

  ${isNot("shown")`
    opacity: 0;
    transform: scale(0.7);
  `};
`;

const ButtonLoading = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0;
  transform: scale(0.7);
  transition: opacity 100ms, transform 100ms;
  display: flex;
  align-items: center;
  justify-content: center;

  ${is("shown")`
    opacity: 1;
    transform: none;
  `};

  svg {
    height: 50%;
  }
`;

export const Button = ({
  children,
  tiny,
  small,
  large,
  xlarge,
  loading,
  block,
  ...rest
}) => {
  const theme = getTheme(rest);

  const size = getSize({ tiny, small, large, xlarge });

  const as = rest.as || "button";

  return (
    <ButtonOuter
      as={as}
      {...rest}
      theme={theme}
      block={block}
      onTouchStart={preventDoubleTapZoom}
    >
      <ButtonInner theme={theme} size={size}>
        <ButtonText shown={!loading}>{children}</ButtonText>
        <ButtonLoading shown={loading}>
          <Spinner />
        </ButtonLoading>
      </ButtonInner>
    </ButtonOuter>
  );
};
