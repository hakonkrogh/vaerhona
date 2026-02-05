import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

import * as PlaceService from '../services/place-service';
import * as SnapshotService from '../services/snapshot-service';
import config from '../services/config';

export const resolvers = {
  Query: {
    places() {
      return PlaceService.getTopPublicPlaces({ limit: 10 });
    },
    place(_, { name: placeName }) {
      return PlaceService.getPlace({
        placeName,
      });
    },
    async snapshots(_, { place: placeName, ...rest }) {
      const place = await PlaceService.getPlace({
        placeName,
      });

      return SnapshotService.getSnapshots({
        place,
        ...rest,
      });
    },
  },
  MutationResponse: {
    __resolveType(mutationResponse, context, info) {
      return null;
    },
  },
  Mutation: {
    snapshots: () => ({}),
    async addSnapshot(_, body) {
      try {
        const snapshot = await SnapshotService.addSnapshotLegacy(body);

        return {
          success: true,
          message: 'Snapshot added',
          snapshot,
        };
      } catch (error) {
        return {
          success: false,
          message: error,
        };
      }
    },
  },
  SnapshotMutations: {
    async add(_, { input }) {
      try {
        const snapshot = await SnapshotService.addSnapshot(input);

        return {
          success: true,
          message: 'Snapshot added',
          snapshot,
        };
      } catch (e) {
        console.log(e);
        return {
          success: false,
        };
      }
    },
  },
  Snapshot: {
    date(snapshot) {
      return new Date(snapshot.dateAdded);
    },
    image(snapshot) {
      const baseUrl =
        config.environment === 'development'
          ? 'https://vaerhona-development.s3-eu-west-1.amazonaws.com'
          : 'https://vaerhona.s3-eu-west-1.amazonaws.com';
      const date = new Date(snapshot.dateAdded);
      return `${baseUrl}/${snapshot.placeName}/${date.getFullYear()}/${
        date.getMonth() + 1
      }/${snapshot.cuid}`;
    },
  },
  YrWeather: {
    windDirectionCompass(yrWeather) {
      const degrees = yrWeather.windFromDirection;
      if (degrees == null) return null;

      const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const index = Math.round(degrees / 45) % 8;
      return directions[index];
    },
  },
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date (custom scalar type)',
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize(value) {
      return value.toISOString(); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      return null;
    },
  }),
};
