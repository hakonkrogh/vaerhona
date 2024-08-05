if (!process.env.MONGO_DB_URI) {
  throw Error('process.env.MONGO_DB_URI is not set');
}

const config = {
  environment: 'production', // process.env.NODE_ENV || 'development',

  mongo: {
    url: process.env.MONGO_DB_URI,
  },
  aws: {
    s3BucketName: '',
    region: '',
  },
};

const resourceNames = {
  development: 'vaerhona-development',
  staging: 'vaerhona-staging',
  production: 'vaerhona',
};

// config.mongo.url = config.mongo.url.replace(
//   '<DATABASE>',
//   resourceNames[config.environment]
// );

config.aws.s3BucketName = resourceNames[config.environment];
config.aws.region = 'eu-west-1';

config.PROTECTED_ROOT_NAMES = ['api', 'static', 'admin'];

console.log(config);

export default config;
