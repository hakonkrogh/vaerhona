import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

import * as PlaceService from '../services/place-service';
import * as SnapshotService from '../services/snapshot-service';
import {
  getSnapshotImageUrl,
  getWindDirectionCompass,
} from '../services/snapshot-view';

export const resolvers = {
  Query: {
    places() {
      return PlaceService.getTopPublicPlaces({
        limit: PlaceService.TOP_PUBLIC_PLACES_LIMIT,
      });
    },
    place(_, { name: placeName }) {
      return PlaceService.getPlace({
        placeName,
      });
    },
    async snapshots(_, { place: placeName, ...rest }) {
      const place = await PlaceService.getPlaceForSnapshots({
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
      return getSnapshotImageUrl(snapshot);
    },
  },
  YrWeather: {
    windDirectionCompass(yrWeather) {
      return getWindDirectionCompass(yrWeather.windFromDirection);
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
