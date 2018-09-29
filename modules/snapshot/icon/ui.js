import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 10px;
  padding: 0 10px;
  cursor: default;
  touch-action: manipulation;

  &:active {
    transform: scale(0.9);
  }
`;

export const Label = styled.div`
  margin-top: 5px;
  font-size: 75%;
  transition: color 150ms;
`;

export const ImageCompare = styled.span`
  display: block;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: -2px;
    left: calc(50% - 1px);
    width: 2px;
    height: calc(100% + 2px);
    background: ${p => p.color};
  }
`;
