import cors from 'micro-cors';
import { send } from 'micro';
import { ApolloServer } from 'apollo-server-micro';

import { typeDefs } from '../../apollo/type-defs';
import { resolvers } from '../../apollo/resolvers';

const loggingPlugin = {
  // Fires whenever a GraphQL request is received from a client.
  requestDidStart(requestContext) {
    const { query, variables } = requestContext.request;

    if (query.includes('mutation')) {
      console.log('Mutation:');
      console.log(query.substring(0, 200));
      console.log('Variables:');
      const { image, imageBase64, ...rest } = variables;
      console.log(JSON.stringify(rest, null, 1));

      // return {
      //   willSendResponse(context) {
      //     console.log('Response:');
      //     console.log(JSON.stringify(context.response.data, null, 1));
      //   },
      // };
    }
  },
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true,
  introspection: true,
  uploads: false,
  plugins: [loggingPlugin],
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
