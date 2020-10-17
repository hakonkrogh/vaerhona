export const PLACE = `
  query PLACE($placeName: String!) {
    place(name: $placeName) {
      cuid
      name
      isPublic
      firstSnapshot {
        cuid
        date
        temperature
        pressure
        humidity
        image
      }
      lastSnapshot {
        cuid
        date
        temperature
        pressure
        humidity
        image
      }
    }
  }
`;

export const PLACE_SNAPSHOTS = `
  query PLACE_SNAPSHOTS(
    $placeName: String!
    $from: String
    $to: String
    $limit: Int
  ) {
    snapshots(
      place: $placeName
      from: $from
      to: $to
      limit: $limit
    ) {
      cuid
      date
      temperature
      humidity
      pressure
      image
      placeName
    }
  }
`;
