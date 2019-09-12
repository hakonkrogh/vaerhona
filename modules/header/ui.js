import styled from 'styled-components';

export const Wrapper = styled.header`
  flex: 0 0 auto;
  height: 50px;
  border-bottom: 1px solid #ddd;
  box-sizing: border-box;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const MainLink = styled.a`
  color: inherit;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
`;

export const Title = styled.span`
  display: inline-block;
  margin-left: 10px;
  position: relative;
  top: 2px;
`;
