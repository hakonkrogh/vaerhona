import { createSchema, createYoga } from 'graphql-yoga';

import { typeDefs } from '../../apollo/type-defs';
import { resolvers } from '../../apollo/resolvers';
import { runWithDb } from '../../services/init';

const loggingPlugin = {
  // Runs for every GraphQL operation, before it is executed.
  onParams({ params }) {
    const { query } = params;
    const variables = params.variables ?? {};

    if (query?.includes('mutation')) {
      console.log('Mutation:');
      console.log(query.substring(0, 200));
      console.log('Variables:');
      // The photo is a long base64 string, so it is left out of the log.
      const { image, imageBase64, input, ...rest } = variables;
      if (input) {
        const { image: inputImage, ...inputRest } = input;
        rest.input = inputRest;
      }
      console.log(JSON.stringify(rest, null, 1));
    }
  },
};

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  graphqlEndpoint: '/api/graphql',
  // The query editor in the browser, also in production.
  graphiql: true,
  // Send the real error messages to the client, as before.
  maskedErrors: false,
  // Any site may call the API, without cookies. Same as before.
  cors: { origin: '*', credentials: false },
  plugins: [loggingPlugin],
});

export const config = {
  api: {
    // Yoga reads the request body itself.
    bodyParser: false,
  },
};

// The body types Yoga can read. Anything else is treated as JSON below.
const KNOWN_BODY_TYPES =
  /json|multipart\/form-data|application\/x-www-form-urlencoded|application\/graphql/i;

export default function handler(req, res) {
  // A CORS preflight needs no database.
  if (req.method === 'OPTIONS') {
    return yoga(req, res);
  }

  // The old server read the body as JSON whatever the Content-Type said. Boxes
  // cannot be updated, so a box that sends another type must keep working.
  if (
    req.method === 'POST' &&
    !KNOWN_BODY_TYPES.test(req.headers['content-type'] ?? '')
  ) {
    req.headers['content-type'] = 'application/json';
  }

  return runWithDb(() => yoga(req, res));
}
