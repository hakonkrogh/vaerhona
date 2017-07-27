import styled from 'styled-components';

export const Wrapper = styled.div`
    background: #fcfcfc;
`;

export const Menu = styled.ul`
    display: flex;
    margin: 0;
    padding: 0;
    list-style: none;
    justify-content: center;
    border-bottom: 1px solid #ddd;
`;

export const MenuItem = styled.li`
    margin: 0 10px;
    padding: 0;

    > a {
        display: inline-block;
        padding: 10px;
    }
`;

export const Content = styled.div`
    padding: 20px;
`;
