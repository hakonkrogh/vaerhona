import gql from 'graphql-tag';

export const typeDefs = gql`
  scalar Date

  type Place {
    cuid: String
    name: String
    isPublic: Boolean
    firstSnapshot: Snapshot
    lastSnapshot: Snapshot
  }

  type Snapshot {
    cuid: String
    placeName: String
    date: Date
    temperature: Float
    pressure: Float
    humidity: Float
    image: String
  }

  type Query {
    places: [Place]
    place(name: String!): Place
    snapshots(
      place: String!
      limit: Int
      from: String
      to: String
      limit: Int
    ): [Snapshot]
  }
`;
