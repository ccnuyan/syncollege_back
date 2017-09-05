import jwt from 'jsonwebtoken';
import config from '../../config';

export const sign = (issuer, payload) => {
  return jwt.sign(
      payload,
      config.auth.jwt.secret,
    {
      // algorithm: 'RS256',
      expiresIn: config.auth.jwt.expiresIn,
      issuer,
    },
    );
};

export const verify = (token) => {
  return jwt.verify(token, config.auth.jwt.secret);
};

