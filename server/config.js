const config = {
  mongoURL: process.env.MONGO_URL || 'mongodb://localhost:27017/vaerhona',
  port: process.env.PORT || 8000,
  aws: {}
};

config.aws.s3BucketName = process.env.NODE_ENV === 'production' ? 'vaerhona' : 'vaerhona-test';
config.imageUrlBase = `https://${config.aws.s3BucketName}.s3-eu-west-1.amazonaws.com`;

export default config;
