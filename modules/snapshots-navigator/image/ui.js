import styled from 'styled-components';
import is from 'styled-is';

export const Outer = styled.div`
  flex-grow: 1;

  --navigation-buttons-height: 65px;
`;

export const Images = styled.div`
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
  margin-bottom: var(--navigation-buttons-height);

  ${is('compare')`
    flex: 0 0 auto;
    margin-bottom: 42px;
  `};
`;

export const Bottom = styled.div`
  height: var(--navigation-buttons-height);
  position: fixed;
  background: #fff;
  /* bottom: var(--icon-menu-height); */
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const BottomInner = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  max-width: 500px;
  margin: 0 auto;

  > span {
    width: 50%;
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
