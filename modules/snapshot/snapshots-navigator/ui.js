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
`;

export const IconMenu = styled.div`
  padding: 0 20px;
  display: flex;
  justify-content: center;
  height: 40px;
  box-sizing: border-box;
  border-top: 1px solid #ccc;
  flex-shrink: 0;
 
  svg path {
    transition: fill 150ms;
  }
`;
