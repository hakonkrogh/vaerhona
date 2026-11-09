import { useEffect } from 'react';

/**
 * The back button can restore a saved copy of the page, which could show an
 * older snapshot than the latest. Reloading gets the latest from the server.
 */
export function useReloadOnRestore() {
  useEffect(() => {
    function onPageShow(event) {
      if (event.persisted) {
        window.location.reload();
      }
    }

    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);
}
