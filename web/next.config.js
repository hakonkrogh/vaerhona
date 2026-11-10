const { initOpenNextCloudflareForDev } = require('@opennextjs/cloudflare');

module.exports = {
  // Build the packages into the server code, and do not load them from
  // node_modules at run time. graphql 17 is an ES module, and Node failed when
  // our code loaded it with require() while graphql-yoga loaded it with
  // import. Built in, there is one copy and one way of loading it.
  bundlePagesRouterDependencies: true,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.xn--vrhna-sra2k.no' }],
        destination: 'https://xn--vrhna-sra2k.no/:path*',
        permanent: true,
      },
    ];
  },
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

// Makes Cloudflare bindings available in `next dev` (skipped during `next build`)
if (process.env.NODE_ENV !== 'production') {
  initOpenNextCloudflareForDev();
}
