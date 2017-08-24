import styled from 'styled-components';

export const Outer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const Inner = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

export const DateAdded = styled.div`
  flex: 0 0 auto;
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: capitalize;
  color: #555;
`;

export const DateAddedTimeAgo = styled.div`
  font-size: 1.5rem;
  text-align: center;
  color: #555;
  margin-bottom: 10px;

  &::first-letter {
    text-transform: uppercase;
  }
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
