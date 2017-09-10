import oauth2Controller from './oauth2/oauth2Controller';

import user from './user';
import works from './works';

export default (app, { pgPool }) => {
  // This is not api, just redirect
  app.use('/oauth', (req, res, next) => {
    req.context = { pgPool };
    return oauth2Controller(req, res, next);
  }); // notice here is use not route

  // These are user apis
  app.use('/user', (req, res, next) => {
    req.context = { pgPool };
    return user(req, res, next);
  }); // notice here is use not route

  // These are works apis
  app.use('/works', (req, res, next) => {
    req.context = { pgPool };
    return works(req, res, next);
  }); // notice here is use not route
};
