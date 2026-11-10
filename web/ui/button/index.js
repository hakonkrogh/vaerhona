import React from 'react';

import { Spinner } from '../spinner';

import preventDoubleTapZoom from './preventDoubleTapZoom';
import styles from './button.module.css';

// The first theme flag that is set wins. Primary is the default.
function getTheme({ primary, clean, danger }) {
  if (primary !== undefined) return 'primary';
  if (clean !== undefined) return 'clean';
  if (danger !== undefined) return 'danger';
  return 'primary';
}

// Medium is the default and has no class of its own.
function getSize({ tiny, small, large, xlarge }) {
  if (tiny) return 'tiny';
  if (small) return 'small';
  if (large) return 'large';
  if (xlarge) return 'xlarge';
  return null;
}

function classNames(...names) {
  return names.filter(Boolean).join(' ');
}

export const Button = ({
  children,
  tiny,
  small,
  large,
  xlarge,
  loading,
  block,
  primary,
  clean,
  danger,
  as: Tag = 'button',
  className,
  ...rest
}) => {
  const theme = getTheme({ primary, clean, danger });
  const size = getSize({ tiny, small, large, xlarge });

  return (
    <Tag
      {...rest}
      className={classNames(
        styles.outer,
        block && styles.block,
        loading && styles.isLoading,
        className
      )}
      onTouchStart={preventDoubleTapZoom}
    >
      <span className={classNames(styles.inner, styles[theme], styles[size])}>
        <span className={styles.text}>{children}</span>
        <span className={styles.loading}>
          <Spinner />
        </span>
      </span>
    </Tag>
  );
};
