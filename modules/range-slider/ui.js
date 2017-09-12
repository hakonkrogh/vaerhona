import styled from 'styled-components';

export const Container = styled.div`
  height: 60px;
	display: flex;
  flex-direction: column;
  user-select: none;
  touch-action: none;
  margin-top: 10px;
  ${props => props.hide ? 'visibility: hidden': ''}
`;

export const Values = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  flex-grow: 1;
  margin: 10px 10px 0;
  font-size: 12px;
  text-transform: capitalize;
`;

export const Outer = styled.div`
  padding: 0 40px;
  display: flex;
  height: 40px;
`;

export const Inner = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;

  &::before,
  &::after {
    content: "";
    height: 10px;
    width: 1px;
    position: absolute;
    top: 8px;
    left: 0;
    background: #a0a0a0;
  }

  &::after {
    left: auto;
    right: 0;
  }
`;

export const Line = styled.div`
	height: 1px;
	background: #aaa;
	width: 100%;
`;

export const Indicator = styled.div`
	width: 0;
	height: 0;
	position: absolute;
	top: 50%;
  left: 0;

  &::before {
    content: '';
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #a0a0a0;
    display: block;
    position: absolute;
    top: -7px;
    left: -8px;
  }
`;
