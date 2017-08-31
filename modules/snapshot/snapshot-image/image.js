import React from 'react';
import styled from 'styled-components';

import Loader from '../../Loader';
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

const LoaderOuter = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoaderInner = styled.div`
  padding: 10px 15px;
  background: rgba(0, 0, 0, .5);
  color: rgba(255, 255, 255, .75);
  border-radius: 3px;
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
    clearTimeout(this.loadingTimeout);
    this.setState({ loading: false });
  }

  onError () {
    clearTimeout(this.loadingTimeout);
    this.setState({ loading: false, error: true });
  }

  componentWillReceiveProps ({ src }) {
    if (src !== this.props.src) {
      this.loadingTimeout = setTimeout(() => {
        this.setState({ loading: true, error: false });
      }, 50);
    }
  }

  componentWillUnmount () {
    clearTimeout(this.loadingTimeout);
  }

  render () {
    const { src, innerRef } = this.props;
    const { loading, error } = this.state;
    return (
      <Outer innerRef={innerRef}>
        {loading && (
          <LoaderOuter>
            <LoaderInner>
              <Loader color={'inherit'} size={'small'}>Laster ned bilde...</Loader>
            </LoaderInner>
          </LoaderOuter>
        )}
        {error ? '=(' : <img src={src} onLoad={this.onLoad} onError={this.onError} />}
      </Outer>
    );
  }
}
