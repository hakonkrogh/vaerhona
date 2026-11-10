import React from 'react';

export const IconArrow = ({ size = 24, left, style, ...rest }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={left ? { transform: 'rotate(180deg)', ...style } : style}
      {...rest}
    >
      <path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z" />
    </svg>
  );
};
