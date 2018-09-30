import React, { PropTypes, Component } from "react";
import Link from "next/link";

import { IconApp } from "ui";
import { Wrapper } from "./ui";

export default class Header extends Component {
  render() {
    return (
      <Wrapper>
        <Link as="/" href="/index">
          <a>
            <IconApp size={30} />
          </a>
        </Link>
        <span>{this.props.headerTitle}</span>
        {this.props.children}
      </Wrapper>
    );
  }
}
