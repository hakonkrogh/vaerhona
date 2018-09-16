import styled from "styled-components";

import { Button } from "ui";

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
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 3px;

  &::first-letter {
    text-transform: uppercase;
  }
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
  padding: 0 20px;
  font-size: 1.5rem;
  color: #555;

  > span {
    display: inline-block;
    margin: 0 10px;
    text-align: center;
    min-width: 50px;
  }
`;

export const Bottom = styled.div`
  flex: 1 0 50px;
  display: flex;
  justify-content: space-between;

  > span {
    flex: 0 0 50%;
    display: flex;

    > button {
      flex: 1 1 50%;
      padding: 0;
      touch-action: none;
      outline-offset: -5px;
      white-space: nowrap;

      &:disabled {
        opacity: 0.25;
      }

      svg:not(:first-child) {
        margin-left: -10px;
      }
    }
  }
`;
