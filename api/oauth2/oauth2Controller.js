import { Router } from 'express';
import querystring from 'querystring';
import request from 'request';
import uuid from 'uuid';

import config from '../../config';

import { sign } from '../services/tokenServices';

// https://www.npmjs.com/package/request

// qq constants
const router = Router();

/**
 * goGet - sugar for request
 *
 * @param  {type} url      url to request
 * @param  {type} params   params object in query
 * @param  {type} callback callback function
 * @return {type}          undefined
 */
function goGet(url, params, callback) {
  request({
    method: 'GET',
    uri: `${url}?${querystring.stringify(params)}`,
    json: true,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }, callback);
}


// step 1
// luanch the qq authentication approach
router.get('/qq/luanch', (req, res) => {
  const state = uuid.v4();

  const query = {
    response_type: 'code',
    scope: 'get_user_info',
    client_id: config.oauth2.qq.app_id,
    redirect_uri: config.oauth2.qq.redirect_uri,
    state,
  };
  const location = `${config.oauth2.qq.pcCodeHost}?${querystring.stringify(query)}`;
  res.setHeader('location', location);
  res.status(302).send();
});

// step2
router.get('/qq/callback', (req, res, next) => {
  // ref http://wiki.connect.qq.com/oauth2-0%E5%BC%80%E5%8F%91%E6%96%87%E6%A1%A3

  const { state, code } = req.query;

  // TODO verify state
  const query = {
    grant_type: 'authorization_code',
    state,
    code,
    client_id: config.oauth2.qq.app_id,
    client_secret: config.oauth2.qq.app_key,
    redirect_uri: config.oauth2.qq.redirect_uri,
  };

  // go get the token
  goGet(config.oauth2.qq.pcTokenHost, query, (err1, rs1, bd1) => {
    if (err1) {
      return next(err1);
    }

    const { access_token, expires_in, refresh_token } = querystring.parse(bd1); // eslint-disable-line

    // go get the openid
    goGet(config.oauth2.qq.pcOpenidHost, { access_token }, (err2, rs2, bd2) => {
      if (err2) {
        return next(err2);
      }
      const bodyObject = JSON.parse(bd2.match(/{.+}/)[0]);
      const openid = bodyObject.openid;

      req.oauth = {
        provider: 'qq',
        qq: {
          openid,
          access_token,
        },
      };

      // go get the user info
      goGet(config.oauth2.qq.infoHost, {
        openid,
        oauth_consumer_key: config.oauth2.qq.app_id,
        access_token,
      }, (err3, rs3, bd3) => { // eslint-disable-line
        if (err3) {
          return next(err3);
        }

        /*
          { ret: 0,
          msg: '',
          is_lost: 0,
          nickname: '严程序',
          gender: '男',
          province: '湖北',
          city: '武汉',
          year: '1983',
          figureurl: 'http://qzapp.qlogo.cn/qzapp/101271080/DC2161A5A64497EDC71552DF6850E092/30',
          figureurl_1: 'http://qzapp.qlogo.cn/qzapp/101271080/DC2161A5A64497EDC71552DF6850E092/50',
          figureurl_2: 'http://qzapp.qlogo.cn/qzapp/101271080/DC2161A5A64497EDC71552DF6850E092/100',
          figureurl_qq_1: 'http://q.qlogo.cn/qqapp/101271080/DC2161A5A64497EDC71552DF6850E092/40',
          figureurl_qq_2: 'http://q.qlogo.cn/qqapp/101271080/DC2161A5A64497EDC71552DF6850E092/100',
          is_yellow_vip: '0',
          vip: '0',
          yellow_vip_level: '0',
          level: '0',
          is_yellow_year_vip: '0' }
        */

        req.oauth = {
          provider: 'qq',
          unique_provider_id: openid,
          profile: bd3,
        };
        next('route');
      });
    });
  });
});

/**
 * req.provider
 * req[req.provider].openid,
 * req[req.provider].nickname
 * req[req.provider].access_token
 */
// http://expressjs.com/en/guide/using-middleware.html#middleware.router
router.get('/:vender/callback', async (req, res) => {
  // const provider = req.oauth.provider;
  // const query = {};
  const oauth2User = await req.context.pgPool.query('select * from syncollege_db.oauth2Users where unique_provider_id = $1 and provider = $2', [req.oauth.unique_provider_id, req.oauth.provider]); // eslint-disable-line
  /*
  Result {
    command: 'SELECT',
    rowCount: 0,
    oid: NaN,
    rows: [],
    fields:
    [ Field {
        name: 'user_id',
        tableID: 16734,
        columnID: 1,
        dataTypeID: 20,
        dataTypeSize: 8,
        dataTypeModifier: -1,
        format: 'text' } ],
    _parsers: [ [Function: parseBigInteger] ],
    RowCtor: [Function: anonymous],
    rowAsArray: false,
    _getTypeParser: [Function: bound ] }
  */
  if (oauth2User.rowCount === 0) {
    // 无oauth登录记录
    const ret = await req.context.pgPool.query('insert into syncollege_db.oauth2Users(unique_provider_id, provider, profile) values ($1,$2,$3) returning *', [req.oauth.unique_provider_id, req.oauth.provider, req.oauth.profile]); // eslint-disable-line
    /*
    Result {
      command: 'INSERT',
      rowCount: 1,
      oid: 0,
      rows:
      [ anonymous {
          id: '124213823308563459',
          user_id: null,
          unique_provider_id: 'DC2161A5A64497EDC71552DF6850E092',
          provider: 'qq',
          profile: [Object] } ],
      ...
    */
    const oauth_user_id = ret.rows[0].id;
    res.setHeader('location', `/#/user/oauth2/callback/${oauth_user_id}`);
    res.status(302).send();
  } else if (oauth2User.rowCount === 1 && !oauth2User.rows[0].user_id) {
    // oauth 登录过但未绑定
    const oauth_user_id = oauth2User.rows[0].id;
    res.setHeader('location', `/#/user/oauth2/callback/${oauth_user_id}`);
    res.status(302).send();
  } else {
    // oauth 登录过且已绑定
    const ret = await req.context.pgPool.query('select * from syncollege_db.oauth_authenticate($1, $2)', [req.oauth.provider, req.oauth.unique_provider_id]); // eslint-disable-line
    const loginInfo = ret.rows[0];
    const token = sign(req.oauth.provider, loginInfo);
    await req.context.pgPool.query('select * from syncollege_db.add_login($1, $2, $3, $4)', [loginInfo.id, req.oauth.unique_provider_id, token, req.oauth.provider]);  // eslint-disable-line
    res.setHeader('location', `/#/user/oauth2/login/${token}`);
    res.status(302).send();
  }
});

export default router;
