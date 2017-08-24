import styled from 'styled-components';
import { breakpoints } from '../../../core/ui-shared';

export const List = styled.ul`
    display: flex;
    justify-content: space-around;
    justify-content: space-evenly;
    margin: 0;
    padding: 0;
    list-style: none;
    flex-wrap: wrap;
`;

export const ListItem = styled.li`
    margin: 10px;
    padding: 0;
    position: relative;

    > a {
        display: block;
        color: #fff;
        font-size: 1.2rem;

        @media (min-width: ${breakpoints.mdMin}) {
          font-size: 1.5rem;
        }
    }
`;

export const Image = styled.img`
    height: 150px;
    width: 150px;
    object-fit: cover;
    display: block;

    @media (min-width: ${breakpoints.mdMin}) {
      height: 300px;
      width: 300px;
    }
`;

const nameHeight = 42;
export const PlaceName = styled.h2`
    font-weight: normal;
    font-size: 1.2rem;
    width: 100%;
    position: absolute;
    top: 50%;
    left: 0;
    margin: -${nameHeight/2}px 0 0;
    padding: 0 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
    text-shadow: 0px 0px 2px #000;

    @media (min-width: ${breakpoints.mdMin}) {
      font-size: 1.5rem;
    }
`;

export const Temperature = styled.div`
    position: absolute;
    left: 10px;
    bottom: 10px;
`;

export const Time = styled.time`
    position: absolute;
    right: 10px;
    bottom: 10px;
`;
