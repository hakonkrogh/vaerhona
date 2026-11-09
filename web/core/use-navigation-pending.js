import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// A fast navigation should not flash the indicator.
const SHOW_AFTER_MS = 150;

/**
 * True while a client-side navigation waits for the next page. Both pages
 * read their data on the server, so this wait includes the data.
 */
export function useNavigationPending() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let timer;

    function start(url, { shallow }) {
      if (!shallow) {
        clearTimeout(timer);
        timer = setTimeout(() => setPending(true), SHOW_AFTER_MS);
      }
    }

    function end() {
      clearTimeout(timer);
      setPending(false);
    }

    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', end);
    router.events.on('routeChangeError', end);

    return () => {
      clearTimeout(timer);
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', end);
      router.events.off('routeChangeError', end);
    };
  }, [router.events]);

  return pending;
}
