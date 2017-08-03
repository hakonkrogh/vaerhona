import styled from 'styled-components';

import Icon from '../../static/icons/app.svg';

export const Wrapper = styled.header`
  flex: 0 0 auto;
  height: 50px;
  border-bottom: 1px solid #aaa;
  box-sizing: border-box;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const AppIcon = styled(Icon)`
  width: 30px;
  height: 30px;
`;
