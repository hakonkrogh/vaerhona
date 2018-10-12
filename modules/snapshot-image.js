import React from "react";

import { prettyDateTime } from "core/date";

// All the possible image variations
const imageSizeVariations = [100, 320, 640, 1024, 1280];

export default class SnapshotImage extends React.Component {
  render() {
    const { date, placeName, cuid, image, sizes } = this.props;

    const props = {
      alt: `Bilde fra ${placeName} tatt ${prettyDateTime(date)}`
    };

    props.src = `${image}/${imageSizeVariations[3]}_r`;
    props.srcSet = imageSizeVariations
      .map(size => `${image}/${size}_r ${size}w`)
      .join(", ");

    return <img sizes={sizes} {...props} />;
  }
}