import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import delay from 'express-delay';

import config from '../config';
import { pg } from '../database/connector';
import byPassAuth from './middleware/byPassAuth';
import crossDomain from './middleware/crossDomain';
import api from '../api/';
import '../globals';

const app = express();

// serve the app
const PORT = process.env.PORT || config.port;

global.report();

try {
  (async () => {
    const pgPool = await pg.connect()
      .catch(err => global.printError(err, __dirname));

    if (config.mode === 'development') {
      app.use(delay(200, 500));
    } else {
      app.use(compression());
    }

    app.use(crossDomain);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended: true,
    }));

    // api middleware
    app.use(byPassAuth(pgPool));
    api(app, { pgPool });

    app.listen(PORT, (err) => {
      if (err) {
        printError(err, __filename);
      } else {
        printMessage(`API is listening on port ${PORT}`, __filename);
      }
    });
  })();
} catch (err) {
  printError(err, __filename);
}
/* eslint-disable no-console */

