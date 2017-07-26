import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';

import { getRouteComponentAndMetadata } from '../isomorphic/api';

export default class AsyncLink extends Component {

  static propTypes = {
    href: PropTypes.string,
    children: PropTypes.any
  }

  linkClicked (e) {
      e.preventDefault();

      const { href } = e.target;

      getRouteComponentAndMetadata(href)
        .then(({ componentName, query, hrefResolved }) => {

            if (componentName[0] !== '/') {
              componentName = '/' + componentName;
            }

            Router.push(componentName, href)
                .catch((err) => {
                    console.error(err);
                });
        });
  }

  render () {
    const { children, href } = this.props;
    return <a href={href} onClick={this.linkClicked}>{children}</a>;
  }
}
