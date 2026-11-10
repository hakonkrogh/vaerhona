export const isServer =
  typeof document === 'undefined' && typeof window === 'undefined';
export const isClient = !isServer;

export function upperFirst(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
