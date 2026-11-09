import React from 'react';

// The small version of the app icon (public/static/icons/app-small.svg).
// It is drawn for sizes up to about 48 px, like the site header.
export const IconApp = ({ size = 24 }) => {
  return (
    <svg
      height={`${size}px`}
      width={`${size}px`}
      viewBox="0 0 512 512"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="512" height="512" rx="112" fill="#0B3D55" />
      <g transform="translate(256 256) scale(1.3) translate(-262 -296)">
        <path
          d="M226 416 V440 M268 416 V440"
          fill="none"
          stroke="#F29A2E"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M212 434 Q212 428 218 428 H234 Q240 428 240 434 V444 C252 444 258 450 258 456 V462 H212 Z"
          fill="#F4B400"
        />
        <path
          d="M254 434 Q254 428 260 428 H276 Q282 428 282 434 V444 C294 444 300 450 300 456 V462 H254 Z"
          fill="#F4B400"
        />
        <path
          d="M370 228 C404 226 422 240 430 256 C416 260 400 266 370 272 Z"
          fill="#F29A2E"
        />
        <g fill="#F7F2E7">
          <ellipse cx="156" cy="258" rx="60" ry="22" transform="rotate(32 156 258)" />
          <ellipse cx="168" cy="236" rx="62" ry="22" transform="rotate(52 168 236)" />
          <ellipse cx="180" cy="222" rx="58" ry="20" transform="rotate(70 180 222)" />
          <circle cx="240" cy="322" r="100" />
          <path d="M290 236 L340 212 L380 296 L320 350 Z" />
          <circle cx="338" cy="246" r="52" />
        </g>
        <ellipse cx="382" cy="282" rx="9" ry="13" fill="#D9483B" />
        <circle cx="356" cy="240" r="9" fill="#1D2A30" />
        <circle cx="328" cy="148" r="10" fill="#D9483B" />
        <circle cx="342" cy="141" r="12" fill="#D9483B" />
        <circle cx="356" cy="148" r="9" fill="#D9483B" />
        <path
          d="M290 208 C290 166 312 146 342 146 C372 146 394 166 394 204 Z"
          fill="#F4B400"
        />
        <path
          d="M258 232 C266 208 300 198 342 196 C374 194 400 188 418 178 C418 196 398 208 370 212 C334 216 302 222 284 238 C274 248 256 244 258 232 Z"
          fill="#F4B400"
        />
      </g>
    </svg>
  );
};
