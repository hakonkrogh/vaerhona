module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd31r10omfuzino.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'vaerhona.s3-eu-west-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'vaerhona-development.s3-eu-west-1.amazonaws.com',
      },
    ],
    minimumCacheTTL: 2147483647, // Max 32-bit integer (~68 years) - effectively forever
  },
};
