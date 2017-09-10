/*
  this middleware won't interupt the anonymous accessingß
*/

import { verify } from '../../api/services/tokenServices';

export default (pgPool) => {
  return async (req, res, next) => {
    // no authorization token: bypass
    if (!req.headers.authorization) {
      return next();
    }
    // authorization not in right format: bypass
    const breaks = req.headers.authorization.split(' ');
    if (breaks.length !== 2 || breaks[0] !== 'bearer') {
      return next();
    }

    try {
      if (breaks[1] === 'null') {
        global.printError('token null', __filename);
        return;
      }

      const decoded = verify(breaks[1]);
      const pres = await pgPool
        .query('select * from syncollege_db.authenticate($1,$2,$3)', ['token', breaks[1], decoded.iss])
        .then(ret => ret.rows[0]);

      if (pres.success) {
        req.user = pres;
        req.user.token = '';
      }
    } catch (err) {
      global.printError(err, __filename);
    } finally {
      next();
    }
  };
};
