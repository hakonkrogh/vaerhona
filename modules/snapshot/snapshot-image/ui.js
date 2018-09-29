import styled from "styled-components";
import is from "styled-is";

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
  font-size: 1.5rem;
  color: #555;

  > span {
    display: inline-block;
    margin: 0 20px;
    text-align: center;
    min-width: 80px;
  }
`;

export const Images = styled.div`
  flex: 1 1 auto;
  display: flex;
  justify-content: center;

  ${is("compare")`
    > :first-child {
      margin-right: 10px;
    }
    > :last-child {
      margin-left: 10px;
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
