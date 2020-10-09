import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    --icon-menu-height: 40px;
  }

  body {
    margin: 0;
    font-family: 'Montserrat', sans-serif;
  }

  * {
    box-sizing: border-box;
  }
`;
