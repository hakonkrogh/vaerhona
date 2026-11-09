export const isServer =
  typeof document === 'undefined' && typeof window === 'undefined';
export const isClient = !isServer;
