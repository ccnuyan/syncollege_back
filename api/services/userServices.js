import { sign } from './tokenServices';

const authenticate = async ({ username, password, oauth_user_id }, { pgPool }) => {
  let user = {};
  if (oauth_user_id) {
    const oauth_user = await pgPool
          .query('select * from membership.oauth2Users where id = $1', [oauth_user_id])
          .then(res => res.rows[0]);
    user = await pgPool
          .query('select * from membership.authenticate($1, $2, $3, $4)', [username, password, 'local', oauth_user.id])
          .then(res => res.rows[0]);
  } else {
    user = await pgPool
          .query('select * from membership.authenticate($1, $2)', [username, password])
          .then(res => res.rows[0]);
  }

  if (user.success) {
    user.token = sign('token', user);
    await pgPool.query('select * from membership.add_login($1, $2, $3, $4)', [user.id, 'token', user.token, 'token']);
    return user;
  }
  return { success: false };
};

const register = async ({ username, password, oauth_user_id }, { pgPool }) => {
  let user = {};
  if (oauth_user_id) {
    user = await pgPool
        .query('select * from membership.register($1,$2,$3)', [
          username,
          password,
          oauth_user_id,
        ])
        .then((dbres) => {
          const registerInfo = dbres.rows[0];
          return registerInfo;
        });
  } else {
    user = await pgPool
        .query('select * from membership.register($1,$2)', [
          username,
          password,
        ])
        .then((dbres) => {
          const registerInfo = dbres.rows[0];
          return registerInfo;
        });
  }
  if (user.success) {
    user.token = sign('token', user);
    await pgPool.query('select * from membership.add_login($1, $2, $3, $4)', [user.id, 'token', user.token, 'token']);
    return user;
  }
  return { success: false };
};

const username_check = ({ username }, { pgPool }) => {
  return pgPool.query('select * from membership.users where username=$1', [username])
          .then((res) => {
            return { valid: res.rowCount < 1,
              username };
          });
};

const get_oauth_user = ({ oauth_user_id }, { pgPool }) => {
  return pgPool.query('select * from membership.oauth2Users where id = $1', [oauth_user_id])
          .then((res) => {
            if (res.rowCount === 1) {
              return res.rows[0];
            }
            return { success: false };
          });
};

export default {
  authenticate,
  register,
  username_check,
  get_oauth_user,
};
