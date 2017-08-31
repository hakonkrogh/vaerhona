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
  width: 30px;
  height: 27px;
  margin-bottom: 10px;
  color: #00628b;
`;

const SpinnerBar = styled.span`
  background-color: currentColor;
  height: 100%;
  width: 6px;
  display: inline-block;
  animation: ${animation} 1.2s infinite ease-in-out;

  &:nth-child(2) { animation-delay: -1.1s; }
  &:nth-child(3) { animation-delay: -1.0s; }
  &:nth-child(4) { animation-delay: -0.9s; }
  &:nth-child(5) { animation-delay: -0.8s; }
`;

export default ({ children }) => (
  <Outer>
    <Spinner>
      <SpinnerBar />
      <SpinnerBar />
      <SpinnerBar />
      <SpinnerBar />
      <SpinnerBar />
    </Spinner>
    {children}
  </Outer>
);
