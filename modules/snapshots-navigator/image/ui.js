import styled from 'styled-components';
import is from 'styled-is';

import { responsive } from 'ui';

export const Outer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: 10px;

  --navigation-buttons-height: 65px;
`;

export const Inner = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

export const DateTimeAgo = styled.div`
  font-size: 1.5em;
  text-align: center;
  margin-bottom: 3px;

  &::first-letter {
    text-transform: uppercase;
  }

  ${is('compare')`
    ${responsive.smAndLess} {
      font-size: 1.2em;
    }
  `};
`;

export const DateString = styled.div`
  display: block;
  color: #888;
  text-align: center;
  margin-bottom: 15px;
  position: relative;
`;

export const DateInputPlacer = styled.span`
  position: relative;
  display: inline-block;
`;

export const DateInput = styled.input.attrs(() => ({
  type: 'date',
}))`
  appearance: none;
  font-size: 1rem;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0;
  border: none;

  &::-webkit-calendar-picker-indicator {
    width: 100%;
    height: 100%;
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &::-webkit-clear-button {
    display: none;
  }

  &::-ms-clear {
    width: 0;
    height: 0;
  }
`;

export const Values = styled.div`
  flex: 0 0 auto;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-around;
  font-size: 1.5em;
  color: #555;

  > span {
    margin: 0 20px;
    text-align: center;
    min-width: 80px;
  }

  ${is('compare')`
    max-width: 50vw;
    margin-bottom: 0;
    font-size: 1em;

    > span {
      margin: 0;
      min-width: 0;
    }
  `};
`;

export const Images = styled.div`
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
  margin-bottom: calc(
    var(--icon-menu-height) + var(--navigation-buttons-height) + 15px
  );

  ${is('compare')`
    flex: 0 0 auto;
    margin-bottom: 42px;
  `};
`;

export const Bottom = styled.div`
  height: var(--navigation-buttons-height);
  position: fixed;
  bottom: var(--icon-menu-height);
  left: 0;
  width: 100%;

  &::after {
    content: var(--icon-menu-height);
  }
`;

export const BottomInner = styled.div`
  display: flex;
  justify-content: space-between;
  max-width: 500px;
  margin: 0 auto;

  > span {
    width: 50%;
    display: flex;

    > button {
      flex: 1 1 50%;
      padding: 0;
      outline-offset: -5px;
      white-space: nowrap;

      &:active {
        transform: scale(0.9);
      }

      &,
      * {
        touch-action: manipulation;
      }

      &:disabled {
        opacity: 0.25;
      }

      svg:not(:first-child) {
        margin-left: -10px;
      }
    }
  }
`;
