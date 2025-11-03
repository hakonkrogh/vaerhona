module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd31r10omfuzino.cloudfront.net',
      },
    ],
    minimumCacheTTL: 2147483647, // Max 32-bit integer (~68 years) - effectively forever
  },
};
