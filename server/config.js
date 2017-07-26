<<<<<<< master
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
=======
const config = {
  api: {
    uri: process.env.API_URI
  },
  port: process.env.PORT || 3000
>>>>>>> Deleted uneeded files. Clean up
}
>>>>>>> Server refactoring

export default Object.freeze(config);
