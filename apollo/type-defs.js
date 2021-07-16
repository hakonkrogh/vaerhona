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

  interface MutationResponse {
    success: Boolean!
    message: String!
  }

  type AddSnapshotMutationResponse implements MutationResponse {
    success: Boolean!
    message: String!
    snapshot: Snapshot
  }

  type SnapshotMutations {
    add(input: AddSnapshotMutationInput!): AddSnapshotMutationResponse!
  }

  input AddSnapshotMutationInput {
    boxId: String!
    date: Date
    temperature: Float!
    humidity: Float!
    pressure: Float
    image: String
  }

  type Mutation {
    snapshots: SnapshotMutations!
    addSnapshot(
      placeCuid: String!
      date: Date
      temperature: Float
      pressure: Float
      humidity: Float
      imageBase64: String
    ): AddSnapshotMutationResponse
  }
`;
