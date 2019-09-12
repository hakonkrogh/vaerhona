import styled from 'styled-components';
import is from 'styled-is';

import { responsive } from 'ui';

export const Outer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: 10px;
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
    ${responsive.smAndLess} {
      max-width: 50vw;
      margin-bottom: 0;
      font-size: 1em;

      > span {
        margin: 0;
        min-width: 0;
      }
    }
  `};
`;

export const Images = styled.div`
  flex: 1 1 auto;
  display: flex;
  justify-content: center;

  ${is('compare')`
    ${responsive.smAndLess} {
      flex: 0 0 auto;
      margin-bottom: 42px;
    }
  `};
`;

export const Bottom = styled.div`
  flex: 0 0 65px;
  display: flex;
  justify-content: space-between;

  > span {
    flex: 0 0 50%;
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
