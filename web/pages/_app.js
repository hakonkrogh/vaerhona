import Head from 'next/head';
import styled, { keyframes } from 'styled-components';

import { GlobalStyle } from 'ui';
import { useNavigationPending } from 'core/use-navigation-pending';

const slide = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
`;

// A thin bar at the top while the next page loads.
const NavigationBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 3px;
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    height: 100%;
    background: #5bbad5;
    animation: ${slide} 1s ease-in-out infinite;
  }
`;

export default function App({ Component, pageProps }) {
  const navigating = useNavigationPending();

  return (
    <>
      <Head>
        {/* As a home screen app, iOS draws the page under the status bar and
            the home indicator. viewport-fit=cover makes that explicit, and
            the safe-area-inset values then say how much room to leave. */}
        <meta
          name="viewport"
          content="width=device-width, viewport-fit=cover"
        />
      </Head>
      <GlobalStyle />
      {navigating && <NavigationBar role="progressbar" aria-label="Laster" />}
      <Component {...pageProps} />
    </>
  );
}
