const isServer = typeof document === 'undefined' && typeof window === 'undefined';
const isClient = !isServer;

export {
    isServer,
    isClient
};
