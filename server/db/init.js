import mongoose from 'mongoose';
import serverConfig from './config';
import insertDummyData from './dummy-data';

mongoose.connect(serverConfig.mongoURL, error => {
  if (error) {
    console.error('Could not connect to the mongodb instance!');
    throw error;
  }

  // feed some dummy data in DB.
  if (process.env.NODE_ENV === 'development') {
    insertDummyData();
  }
});