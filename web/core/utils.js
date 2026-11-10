export const isServer =
  typeof document === 'undefined' && typeof window === 'undefined';
export const isClient = !isServer;

export function upperFirst(text) {
  if (!text) {
    return '';
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
}
