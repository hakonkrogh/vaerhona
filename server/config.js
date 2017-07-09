<<<<<<< master
const config = {
  port: process.env.PORT || 8000,
  aws: {}
};
=======
let config;

try {
  const configFile = fs.readFileSync('./config.secret');
  const configFileContent = JSON.parse(configFile);
  console.log('Read config file!', configFileContent);
} catch (e) {
  console.log('Config file not present. Using ENV instead');

  config = {
    mongoURL: process.env.MONGO_URL,
    port: process.env.PORT || 3000
  }
}
>>>>>>> Server refactoring

const buckets = {
  'development': 'vaerhona-development',
  'staging': 'vaerhona-staging',
  'production': 'vaerhona'
};

config.aws = {
  s3BucketName: buckets[process.env.AWS_PROFILE || 'development']
}

config.imageUrlBase = `https://${config.aws.s3BucketName}.s3-eu-west-1.amazonaws.com`;

config.PROTECTED_ROOT_NAMES = ['api', 'static', 'admin'];

export default Object.freeze(config);
