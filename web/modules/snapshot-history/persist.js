let asked = false;

/**
 * Asks the browser not to clear the local database when the disk gets full.
 * It is only a wish, and the page works the same if the answer is no.
 *
 * Firefox shows the user a permission prompt for this, so there it is asked
 * only in an installed app.
 */
export function requestPersistentStorage() {
  if (asked || !globalThis.navigator?.storage?.persist) {
    return;
  }

  asked = true;

  const installed = globalThis.matchMedia?.(
    '(display-mode: standalone)'
  ).matches;
  const prompts = /firefox/i.test(navigator.userAgent);

  if (installed || !prompts) {
    navigator.storage.persist().catch(() => {});
  }
}
