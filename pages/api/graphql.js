import cors from 'micro-cors';
import { ApolloServer } from 'apollo-server-micro';

import { typeDefs } from '../../apollo/type-defs';
import { resolvers } from '../../apollo/resolvers';

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true,
  introspection: true,
  uploads: false
});

export const config = {
  api: {
    bodyParser: false
  }
};

export default cors()(apolloServer.createHandler({ path: '/api/graphql' }));
