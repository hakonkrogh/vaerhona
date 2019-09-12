import React from 'react';
import Link from 'next/link';

import { IconApp } from 'ui';
import { Wrapper, MainLink, Title } from './ui';

const Header = ({ title, children }) => (
  <Wrapper>
    <Link as="/" href="/index" passHref>
      <MainLink>
        <IconApp size={30} />
        <Title>{title}</Title>
      </MainLink>
    </Link>
    {children}
  </Wrapper>
);

export default Header;
