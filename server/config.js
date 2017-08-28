const config = {
  apiUri: process.env.API_URI,
  port: process.env.APP_PORT || 3000
};

module.exports = Object.freeze(config);
