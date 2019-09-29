import styled from 'styled-components';

import { responsive } from 'ui';

export const List = styled.ul`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin: 0;
  padding: 0 0 100px;
  list-style: none;
`;

export const ListItem = styled.li`
  margin: 30px;
  padding: 0;
  position: relative;

  > a {
    display: flex;
    flex-direction: column;
    font-size: 1.2rem;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.2);
    background: #fafafa;
    border-radius: 15px;
    overflow: hidden;
    color: inherit;
    text-decoration: none;
    height: 250px;
    width: 250px;

    ${responsive.mdAndMore} {
      height: 300px;
      width: 300px;
      font-size: 1.5rem;
    }
  }
`;

export const Upper = styled.div`
  flex: 0 0 auto;
  margin: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const PlaceName = styled.h2`
  font-weight: normal;
  font-size: 1.2rem;
  margin: 0;
  flex: 1 1 auto;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;

  ${responsive.mdAndMore} {
    font-size: 1.5rem;
  }
`;

export const Time = styled.time`
  flex: 0 0 auto;
  margin-left: 15px;
  white-space: nowrap;
`;

export const ImageWrapper = styled.figure`
  flex: 1 1 auto;
  display: block;
  margin: 0;
  position: relative;

  img {
    position: absolute;
    height: 100%;
    width: 100%;
    object-fit: cover;
    display: block;
    background: #ccc;
  }
`;
