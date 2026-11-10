// Small line icons, drawn here so no icon library is needed. They take the
// text colour.
function LineIcon({ size = 18, children, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      stroke="currentColor"
      strokeWidth="24"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/** An arrow. 0 degrees points up, and it turns clockwise from there. */
export const Arrow = ({ degrees = 0, ...props }) => (
  <LineIcon {...props}>
    <g transform={`rotate(${degrees} 128 128)`}>
      <line x1="128" y1="216" x2="128" y2="40" />
      <polyline points="56 112 128 40 200 112" />
    </g>
  </LineIcon>
);

export const TrendUp = (props) => (
  <LineIcon {...props}>
    <polyline points="232 56 136 152 96 112 24 184" />
    <polyline points="232 120 232 56 168 56" />
  </LineIcon>
);

export const TrendDown = (props) => (
  <LineIcon {...props}>
    <polyline points="232 200 136 104 96 144 24 72" />
    <polyline points="232 136 232 200 168 200" />
  </LineIcon>
);

export const Minus = (props) => (
  <LineIcon {...props}>
    <line x1="40" y1="128" x2="216" y2="128" />
  </LineIcon>
);
