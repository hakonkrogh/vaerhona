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
  ${(p) =>
    p.center &&
    `
    justify-content: center;
    align-items: center;
    `};
`;

export const IconMenu = styled.div`
  position: fixed;
  left: 0;
  bottom: 0;
  height: var(--icon-menu-height);
  width: 100%;
`;

export const IconMenuInner = styled.div`
  display: flex;
  justify-content: center;
  height: 40px;
  padding: 0 20px;
  box-sizing: border-box;
  border-top: 1px solid #ccc;
  position: relative;

  > div {
    cursor: pointer;
    touch-action: manipulation;
  }

  svg path {
    transition: fill 150ms;
  }
`;

export const SwitchOuter = styled.div`
  position: absolute;
  right: 15px;
  top: 8px;
  display: flex;
  cursor: pointer;

  input {
    appearance: none;
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
  }

  label {
    display: flex;
    align-items: center;

    svg {
      margin-left: 5px;
      position: relative;
      top: 2px;
    }
  }
`;
