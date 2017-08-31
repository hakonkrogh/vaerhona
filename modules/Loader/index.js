import React from 'react';
import styled, { keyframes } from 'styled-components';

const animation = keyframes`
  0%, 40%, 100% {
    transform: scaleY(.4);
    -webkit-transform: scaleY(.4);
  }

  20% {
    transform: scaleY(1);
    -webkit-transform: scaleY(1);
  }
`;

const Outer = styled.span`
  display: inline-flex;
  align-items: center;
  flex-direction: column;
`;

const Spinner = styled.span`
  display: flex;
  width: ${p => p.size ==='small' ? '20px' : '30px'};
  height: ${p => p.size ==='small' ? '17px' : '27px'};
  color: ${p => p.color || '#00628b'};
  margin-bottom: 10px;
`;

const SpinnerBar = styled.span`
  background-color: currentColor;
  flex: 1 1 auto;
  animation: ${animation} 1.2s infinite ease-in-out;

  &:nth-child(2) { animation-delay: -1.1s; }
  &:nth-child(3) { animation-delay: -1.0s; }
  &:nth-child(4) { animation-delay: -0.9s; }
  &:nth-child(5) { animation-delay: -0.8s; }
`;

export default ({ children, color, size }) => (
  <Outer>
    <Spinner color={color} size={size}>
      <SpinnerBar />
      <SpinnerBar />
      <SpinnerBar />
      <SpinnerBar />
      <SpinnerBar />
    </Spinner>
    {children}
  </Outer>
);
