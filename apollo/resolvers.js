import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

import * as PlaceService from '../services/place-service';
import * as SnapshotService from '../services/snapshot-service';

export const resolvers = {
  Query: {
    places() {
      return PlaceService.getTopPublicPlaces({ limit: 10 });
    },
    place(_, { name: placeName }) {
      return PlaceService.getPlace({
        placeName,
        populateSnapshotFields: true
      });
    },
    async snapshots(_, { place: placeName, ...rest }) {
      const place = await PlaceService.getPlace({
        placeName
      });

      return SnapshotService.getSnapshots({
        place,
        ...rest
      });
    }
  },
  Snapshot: {
    date(snapshot) {
      return new Date(snapshot.dateAdded);
    },
    image(snapshot) {
      const date = new Date(snapshot.dateAdded);
      return `https://d31r10omfuzino.cloudfront.net/${
        snapshot.placeName
      }/${date.getFullYear()}/${date.getMonth() + 1}/${snapshot.cuid}`;
    }
  },
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date (custom scalar type)',
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize(value) {
      return value.getTime(); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      return null;
    }
  })
};
