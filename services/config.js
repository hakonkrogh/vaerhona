require('dotenv').config();

if (!process.env.MONGO_DB_URI) {
  throw Error('process.env.MONGO_DB_URI is not set');
}

const config = {
  environment: process.env.NODE_ENV || 'development',

  mongo: {
    url: process.env.MONGO_DB_URI
  },
  aws: {
    s3BucketName: '',
    region: ''
  },
  imageUrlBase: ''
};

const resourceNames = {
  development: 'vaerhona-development',
  staging: 'vaerhona-staging',
  production: 'vaerhona'
};

config.mongo.url = config.mongo.url.replace(
  '<DATABASE>',
  resourceNames[config.environment]
);

config.aws.s3BucketName = resourceNames[config.environment];
config.aws.region = process.env.VH_AWS_REGION;

config.imageUrlBase = `https://${config.aws.s3BucketName}.s3-${config.aws.region}.amazonaws.com`;

config.PROTECTED_ROOT_NAMES = ['api', 'static', 'admin'];

export default config;
