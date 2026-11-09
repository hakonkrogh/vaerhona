import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: ${({ fontFamily }) => fontFamily}, sans-serif;
    /* Room for the camera cut-out when an iPhone is held sideways. */
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }

  * {
    box-sizing: border-box;
  }

  img {
    max-width: 100%;
  }
`;
