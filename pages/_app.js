import { createClient, Provider } from 'urql';

const client = createClient({
  url: '/api/graphql',
});

export default function App({ Component, pageProps }) {
  return (
    <Provider value={client}>
      <Component {...pageProps} />
    </Provider>
  );
}
