import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 10px;
  padding: 0 10px;
  cursor: default;
  touch-action: manipulation;
`;

export const Label = styled.div`
  margin-top: 5px;
  font-size: 75%;
  transition: color 150ms;
`;
