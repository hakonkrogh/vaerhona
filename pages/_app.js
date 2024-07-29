import {
  createClient,
  Provider,
  // dedupExchange,
  cacheExchange,
  fetchExchange,
} from 'urql';
// import { refocusExchange } from '@urql/exchange-refocus';

import { GlobalStyle } from 'ui';
import { isClient } from 'core/utils';

const client = createClient({
  url: '/api/graphql',
  // ...(isClient && {
  // exchanges: [dedupExchange, refocusExchange(), cacheExchange, fetchExchange],
  exchanges: [cacheExchange, fetchExchange],
  // }),
});

export default function App({ Component, pageProps }) {
  return (
    <Provider value={client}>
      <GlobalStyle />
      <Component {...pageProps} />
    </Provider>
  );
}
