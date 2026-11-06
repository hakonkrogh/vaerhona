import React from 'react';

import { IconApp } from 'ui';
import { Wrapper, MainLink, Title } from './ui';

const Header = ({ title, children }) => (
  <Wrapper>
    <MainLink href="/">
      <IconApp size={30} />
      <Title>{title}</Title>
    </MainLink>
    {children}
  </Wrapper>
);

export default Header;
