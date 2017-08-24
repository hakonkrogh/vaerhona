import React from 'react';
import styled from 'styled-components';

import { getImagePath } from '../../../isomorphic/api';

const Outer = styled.div`
  display: flex;
  flex: 1 1 auto;
  position: relative;
  min-height: 200px;

  > img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    flex: 1 1 auto;
    object-fit: cover;
  }
`;

const Loader = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    display: block;
    content: 'Henter bilde...';
    padding: 5px 10px;
    background: rgba(0, 0, 0, .2);
    color: rgba(255, 255, 255, .7);
    border-radius: 3px;
  }
`;

export default class Image extends React.Component {

  constructor (props) {
    super(props);
    this.onLoad = this.onLoad.bind(this);
    this.onError = this.onError.bind(this);
    this.state = {
      loading: false,
      error: false
    };
  }

  onLoad () {
    this.setState({ loading: false });
  }

  onError () {
    this.setState({ loading: false, error: true });
  }

  componentWillReceiveProps ({ src }) {
    if (src) {
      this.setState({ loading: true, error: false });
    }
  }

  render () {
    const { src, innerRef } = this.props;
    const { loading, error } = this.state;
    return (
      <Outer innerRef={innerRef}>
        {loading && <Loader />}
        {error ? '=(' : <img src={src} onLoad={this.onLoad} onError={this.onError} />}
      </Outer>
    );
  }
}
