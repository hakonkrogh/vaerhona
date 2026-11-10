import styles from './spinner.module.css';

/**
 * A turning partial circle. `speed` is 'fast' or 'slow', `thickness` is 1 to
 * 8 and `gap` is 1 to 5.
 */
export const Spinner = ({
  color = 'currentColor',
  gap = 4,
  thickness = 3,
  size = '1em',
  speed,
  className,
  ...props
}) => (
  <svg
    height={size}
    width={size}
    {...props}
    className={[styles.spinner, styles[speed], className]
      .filter(Boolean)
      .join(' ')}
    role="img"
    aria-labelledby="title desc"
    viewBox="0 0 32 32"
  >
    <title id="title">Circle loading spinner</title>
    <desc id="desc">
      Image of a partial circle indicating &qoute;loading&qoute;.
    </desc>
    <circle
      role="presentation"
      cx={16}
      cy={16}
      r={14 - thickness / 2}
      stroke={color}
      fill="none"
      strokeWidth={thickness}
      strokeDasharray={Math.PI * 2 * (11 - gap)}
      strokeLinecap="round"
    />
  </svg>
);
