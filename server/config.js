const config = {
  apiUri: process.env.API_URI,
  port: process.env.APP_PORT || 3000,
  environment: process.env.NODE_ENV || "development",
  graphqlSource: process.env.GRAPHQL_SOURCE || "api"
};

module.exports = Object.freeze(config);
