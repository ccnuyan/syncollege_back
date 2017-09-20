import express from 'express';
import bodyParser from 'body-parser';
import { pg } from '../../database/connector';

// import byPassAuth from './middleware/byPassAuth';

import '../../globals';

import api from '../';

// serve the app

export default async () => {
  const app = express();
  const pgPool = await pg.connect()
      .catch(err => global.printError(err, __dirname));
  app.use(bodyParser.json());
    // api middleware
  api(app, { pgPool });

  return app;
};

