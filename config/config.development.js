export default {
  mode: 'development',
  port: 17000,
  qiniu_mode: 'direct',
  serviceBase: 'http://www.syncollege.com/',
  auth: {
    jwt: {
      secret: '12345678',
      expiresIn: '2 days',
    },
  },
  oauth2: {
    qq: {
      app_id: '101271080',
      app_key: 'c89c950759846307af5a8425bb9a3a64',
      pcCodeHost: 'https://graph.qq.com/oauth2.0/authorize',
      pcTokenHost: 'https://graph.qq.com/oauth2.0/token',
      infoHost: 'https://graph.qq.com/user/get_user_info',
      pcOpenidHost: 'https://graph.qq.com/oauth2.0/me',
      redirect_uri: 'http://www.syncollege.com/api/oauth/qq/callback',
    },
  },
  pg: {
    user: 'postgres',
    database: 'postgres',
    host: 'localhost',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000,
  },
  qiniu: {
    bucket: 'test',
    ak: '-ep_FkVEcGngEskOY3VDYwToOcRkpQeaAv3cvnrZ',
    sk: 'xlHeJJn4u5Ldn5reNI0l2ug5BxV7mDfDP66RAuaH',
    callbackBase: 'http://www.syncollege.com/',
    url: 'http://7xt1pi.com1.z0.glb.clouddn.com/',
  },
};
