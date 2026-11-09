const { initOpenNextCloudflareForDev } = require('@opennextjs/cloudflare');

module.exports = {
  compiler: {
    // Gives each styled component a class name from its file and position.
    // Without it, styled-components counts components in the order their files
    // load, which differs between the server and the browser, so the class
    // names did not match when React took over the page.
    styledComponents: true,
  },
  // Next.js leaves node_modules out of the server build, so the Worker got the
  // whole icon library (about 6 MB). Building it in keeps only the icons used.
  transpilePackages: ['@phosphor-icons/react'],
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
