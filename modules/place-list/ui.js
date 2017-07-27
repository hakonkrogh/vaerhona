import s from 'styled-components';

export const List = s.ul`
    display: flex;
    justify-content: space-around;
    margin: 0;
    padding: 0;
    list-style: none;
`;

export const ListItem = s.li`
    margin: 0;
    padding: 0;
`;

export const Image = s.image`
    height: 300px;
    width: 300px;
    object-fit: contain;
`;
