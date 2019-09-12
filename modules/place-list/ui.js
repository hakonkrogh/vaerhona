import styled from 'styled-components';

import { breakpoints } from 'core/ui-shared';

export const List = styled.ul`
  display: flex;
  justify-content: center;
  margin: 0;
  padding: 0;
  list-style: none;
  flex-wrap: wrap;
`;

export const ListItem = styled.li`
  margin: 30px;
  padding: 0;
  position: relative;

  > a {
    display: block;
    font-size: 1.2rem;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
    background: #fafafa;
    border-radius: 15px;
    overflow: hidden;
    color: inherit;
    text-decoration: none;

    @media (min-width: ${breakpoints.mdMin}) {
      font-size: 1.5rem;
    }
  }
`;

export const Upper = styled.div`
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

  @media (min-width: ${breakpoints.mdMin}) {
    font-size: 1.5rem;
  }
`;

export const Time = styled.time`
  flex: 0 0 auto;
  margin-left: 15px;
`;

export const Image = styled.figure`
  display: block;
  margin: 0;

  img {
    height: 250px;
    width: 250px;
    object-fit: cover;
    display: block;
    background: #ccc;

    @media (min-width: ${breakpoints.mdMin}) {
      height: 300px;
      width: 300px;
    }
  }
`;
