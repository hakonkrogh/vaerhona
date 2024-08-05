import mongoose from 'mongoose';

import config from './config';

mongoose
  .connect(config.mongo.url)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
