import styled from 'styled-components';

export const Outer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const Inner = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;
  margin: 20px 20px 10px;
  box-sizing: border-box;

  max-height: none !important;
  width: auto !important;
`;

export const Canvas = styled.canvas`
  width: 100% !important;
  height: 100% !important;
`;

export const PropChooser = styled.div`
  padding: 0 20px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
