const config = {
  mongoURL: process.env.MONGO_URL || 'mongodb://localhost:27017/vaerhona',
  port: process.env.PORT || 8000,
  aws: {}
};

const buckets = {
  'development': 'vaerhona-development',
  'staging': 'vaerhona-staging',
  'production': 'vaerhona'
};

config.aws.s3BucketName = buckets[process.env.AWS_PROFILE];
config.imageUrlBase = `https://${config.aws.s3BucketName}.s3-eu-west-1.amazonaws.com`;

config.PROTECTED_ROOT_NAMES = ['api', 'static', 'admin'];

Object.freeze(config);

export default config;
