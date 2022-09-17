import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Montserrat', sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  img {
    max-width: 100%;
  }
`;
