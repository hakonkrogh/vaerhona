import mongoose from 'mongoose';

import config from './config';

mongoose.connect(config.mongo.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

export * from './place-service';
export * from './snapshot-service';
