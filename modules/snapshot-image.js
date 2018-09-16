import React from "react";

import { prettyDateTime } from "core/date";

// The date the API started to save as jpg
const jpegStorageDate = new Date("2018-02-22");

export default class SnapshotImage extends React.Component {
  render() {
    const { snapshot, place = {}, ...rest } = this.props;
    const date = new Date(snapshot.date);

    const props = {
      alt: `Bilde fra ${snapshot.placeName || place.name} tatt ${prettyDateTime(
        date
      )}`
    };

    if (date >= jpegStorageDate) {
      const sizes = [100, 320, 640, 1024, 1280];
      props.src = `${snapshot.image}/${sizes[3]}_r`;
      props.srcSet = sizes
        .map(size => `${snapshot.image}/${size}_r ${size}w`)
        .join(", ");
    } else {
      props.src = `/api/snapshot/${snapshot.cuid}/image`;
    }

    return <img {...rest} {...props} />;
  }
}
