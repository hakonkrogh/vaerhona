import React from 'react';
import Link from 'next/link';

import { IconApp } from 'ui';
import styles from './header.module.css';

const Header = ({ title, children }) => (
  <header className={styles.wrapper}>
    <Link className={styles.mainLink} href="/">
      <IconApp size={30} />
      <span className={styles.title}>{title}</span>
    </Link>
    {children}
  </header>
);

export default Header;
