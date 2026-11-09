import styled, { keyframes } from 'styled-components';
import {
  createClient,
  Provider,
  // dedupExchange,
  cacheExchange,
  fetchExchange,
} from 'urql';
// import { refocusExchange } from '@urql/exchange-refocus';

import { GlobalStyle } from 'ui';
import { useNavigationPending } from 'core/use-navigation-pending';

const client = createClient({
  url: '/api/graphql',
  // ...(isClient && {
  // exchanges: [dedupExchange, refocusExchange(), cacheExchange, fetchExchange],
  exchanges: [cacheExchange, fetchExchange],
  // }),
});

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
    <Provider value={client}>
      <GlobalStyle />
      {navigating && <NavigationBar role="progressbar" aria-label="Laster" />}
      <Component {...pageProps} />
    </Provider>
  );
}
