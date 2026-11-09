import React from 'react';

import appSmall from '../../public/static/icons/app-small.svg';

// The small version of the app icon, drawn for sizes up to about 48 px, like
// the site header. Next.js gives the imported file a URL with a content hash,
// so a changed icon gets a new URL and is never served from an old cache.
export const IconApp = ({ size = 24 }) => {
  return (
    <img
      src={appSmall.src}
      width={size}
      height={size}
      alt=""
      style={{ borderRadius: '22%' }}
    />
  );
};
