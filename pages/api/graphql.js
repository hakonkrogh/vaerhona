import cors from 'micro-cors';
import { send } from 'micro';
import { ApolloServer } from 'apollo-server-micro';

import { typeDefs } from '../../apollo/type-defs';
import { resolvers } from '../../apollo/resolvers';

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true,
  introspection: true,
  uploads: false,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const apolloHandler = apolloServer.createHandler({ path: '/api/graphql' });

export default cors()((req, res) => {
  if (req.method === 'OPTIONS') {
    return send(res, 200);
  }

  return apolloHandler(req, res);
});
