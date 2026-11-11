import { Montserrat } from 'next/font/google';

// The site's font. Downloaded at build time and served with the site's own
// files, so the first paint does not wait for a stylesheet from Google.
// pages/_app.js and Storybook (.storybook/preview.js) both use it.
export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});
