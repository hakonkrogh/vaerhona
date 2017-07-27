import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';

import { getRouteComponentAndMetadata } from '../isomorphic/api';

export default class AsyncLink extends Component {

  static propTypes = {
    href: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.any
  }

  constructor (props) {
    super(props);
    this.linkClicked = this.linkClicked.bind(this);
  }

  linkClicked (e) {
      e.preventDefault();

      const { href } = this.props;

      getRouteComponentAndMetadata(href)
        .then(({ componentName, query, hrefResolved }) => {

            if (!componentName || componentName[0] !== '/') {
              componentName = '/' + componentName;
            }

            Router.push(componentName, href)
                .catch((err) => {
                    console.error(err);
                });
        });
  }

  render () {
    const { children, href, className } = this.props;
    return <a href={href} onClick={this.linkClicked} className={className}>{children}</a>;
  }
}
