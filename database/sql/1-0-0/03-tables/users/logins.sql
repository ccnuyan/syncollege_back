create table logins(
  id bigint primary key default id_generator(),

  user_id bigint not null,
  
  provider varchar(64) not null default 'local',
  -- local, token, qq/weixin/weibo

  provider_key varchar(255),
  -- local: username
  -- token: null
  -- qq/weixin/weibo: 'token'
  
  provider_token varchar(4096) not null
  -- local: password
  -- token: jwttoken
  -- qq/weixin/weibo: jwttoken
);