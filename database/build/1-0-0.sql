set search_path = syncollege_db;
set search_path = syncollege_db;

create sequence id_sequence;
create or replace function id_generator(out new_id bigint)
as $$
DECLARE
  our_epoch bigint := 1483200000000; -- 2017/05/01
  seq_id bigint;
  now_ms bigint;
  shard_id int := 1;
BEGIN
  SET search_path = syncollege_db;
  SELECT nextval('id_sequence') %1024 INTO seq_id;
  SELECT FLOOR(EXTRACT(EPOCH FROM now()) * 1000) INTO now_ms;
  new_id := (now_ms - our_epoch) << 23;
  new_id := new_id | (shard_id << 10);
  new_id := new_id | (seq_id);
END;
$$
LANGUAGE PLPGSQL;


set search_path = syncollege_db;

create or replace function random_string(len int default 36)
returns text
as $$
select upper(substring(md5(random()::text), 0, len+1));
$$ 
language sql;

create type login_info as(
  id bigint,
  username varchar,
  gender varchar,
  nickname varchar, 
  role int,
  success boolean,
  message varchar
);
create table works(
  id bigint primary key not null default id_generator(),
  
  creator_id bigint,
  title varchar(256) not null,
  snapshot TEXT not null,
  content TEXT not null,
  visits bigint default 0 not null,
  last_modification timestamptz default now() not null,
  created_at timestamptz default now() not null
);
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
create table oauth2Users(
  id bigint primary key not null default id_generator(),

  user_id bigint,
  -- null if not bound

  unique_provider_id varchar(255) not null,
  provider varchar(16) not null,
  profile json
);
create table users(
  id bigint primary key not null default id_generator(),
  
  user_key varchar(18) default random_string(18) not null,
  username varchar(255) unique not null,
  role int default 10, -- 99/student 10/teacher; 0/admin
  login_count int default 0 not null,
  last_login timestamptz,
  created_at timestamptz default now() not null,

  --profile
  nickname varchar(64),
  gender varchar(16)
);
CREATE TYPE crud_work_info AS(
  id BIGINT,
  creator_id BIGINT,
  creator_email VARCHAR,
  title VARCHAR,
  snapshot TEXT,
  content TEXT,
  visits BIGINT,
  last_modification TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  success BOOLEAN,
  message VARCHAR
);

CREATE OR REPLACE FUNCTION generate_work_crud_result(
  work syncollege_db.works,
  success BOOLEAN,
  message VARCHAR)
RETURNS syncollege_db.crud_work_info
as $$
DECLARE
  creator_email varchar;
BEGIN
  SET search_path=syncollege_db;
  SELECT username FROM users WHERE users.id = work.creator_id into creator_email;
  return (
    work.id,
    work.creator_id, 
    creator_email, 
    work.title, 
    work.snapshot,
    work.content,
    work.visits,
    work.last_modification,
    work.created_at,
    success, 
    message
  )::syncollege_db.crud_work_info;
END;
$$
LANGUAGE PLPGSQL;


CREATE OR REPLACE FUNCTION create_work(
  uid BIGINT, -- username
  tt VARCHAR(256), -- title
  ss TEXT, -- snapshot
  ct TEXT) --content
RETURNS syncollege_db.crud_work_info
as $$
DECLARE
  new_work syncollege_db.works;
  success BOOLEAN;
  return_message VARCHAR(64);
BEGIN
  SET search_path=syncollege_db;
    
  IF EXISTS (SELECT users.id FROM users WHERE users.id = uid)
  THEN
    INSERT INTO works(creator_id, title, snapshot, content)
    VALUES (uid, tt, ss, ct)
    RETURNING * INTO new_work;
    success := TRUE;
    return_message := 'New work created';
  ELSE
    success := FALSE;
    SELECT 'This user does not exist' INTO return_message;
  END IF;
  return syncollege_db.generate_work_crud_result(new_work, success, return_message);
END;
$$
LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION require_work(
  uid BIGINT, -- username
  wid BIGINT) -- content 
RETURNS syncollege_db.crud_work_info
as $$
DECLARE
  require_work syncollege_db.works;
  success BOOLEAN;
  return_message VARCHAR(64);
BEGIN
  SET search_path=syncollege_db;

  SELECT * FROM works WHERE id = wid and creator_id = uid into require_work;

  IF require_work IS NOT NULL
  THEN
    success := TRUE;
    return_message := 'Required work found';
  ELSE
    success := FALSE;
    select 'The work created by this creator does not exist' INTO return_message;
  END IF;
  return syncollege_db.generate_work_crud_result(require_work, success, return_message);
END;
$$
LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION update_work(
  uid BIGINT, -- username
  wid BIGINT, -- workid
  tt VARCHAR(256) DEFAULT NULL , -- title
  ss TEXT DEFAULT NULL , -- snapshot
  ct TEXT DEFAULT NULL ) -- content 
RETURNS syncollege_db.crud_work_info
as $$
DECLARE
  update_work syncollege_db.works;
  success BOOLEAN;
  return_message VARCHAR(64);
BEGIN
  SET search_path=syncollege_db;

  IF EXISTS (SELECT id FROM works WHERE id = wid and creator_id = uid)
  THEN
    IF tt IS NOT NULL THEN 
      UPDATE works SET title = tt, last_modification = now() 
      WHERE id = wid;
    END IF;

    IF ss IS NOT NULL THEN 
      UPDATE works SET snapshot = ss, last_modification = now() 
      WHERE id = wid;
    END IF;

    IF ct IS NOT NULL THEN 
      UPDATE works SET content = ct, last_modification = now() 
      WHERE id = wid;
    END IF;

    SELECT * FROM works WHERE id = wid AND creator_id = uid INTO update_work;
    success := TRUE;
    return_message := 'Work upodated';
  ELSE
    success := FALSE;
    select 'The work created by this creator does not exist' INTO return_message;
  END IF;
  return syncollege_db.generate_work_crud_result(update_work, success, return_message);
END;
$$
LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION delete_work(
  uid BIGINT, -- username
  wid BIGINT) -- workid
RETURNS syncollege_db.crud_work_info
as $$
DECLARE
  deleted_work syncollege_db.works;
  success BOOLEAN;
  return_message VARCHAR(64);
BEGIN
  SET search_path=syncollege_db;

  IF EXISTS (SELECT * FROM works WHERE works.id = wid and works.creator_id = uid)
  THEN
    DELETE FROM works
    WHERE works.id = wid
    RETURNING * INTO deleted_work;
    success := TRUE;
    return_message := 'Work deleted';
  ELSE
    success := FALSE;
    SELECT 'The work created by this creator does not exist' INTO return_message;
  END IF;

  return syncollege_db.generate_work_crud_result(deleted_work, success, return_message);
END;
$$
LANGUAGE PLPGSQL;
-- logins intruduction

-- for local user
  -- provider is 'local'
  -- provider_key is username
  -- provider_token is password

-- for token user
  -- provider is 'token'
  -- provider_key is 'token'
  -- provider_token is jwttoken
  
-- for oauth2 user
  -- provider is 'qq'
  -- provider_key is 'token'
  -- provider_token is jwttoken

drop function if exists add_login(bigint,varchar,varchar,varchar);
create function add_login(userid bigint, key varchar(50), token varchar(4096), new_provider varchar(50))
returns TABLE(
  message varchar(255),
  success boolean
) as
$$
DECLARE
  success boolean :=false;
  message varchar(255) := 'User not found with this username';
  data_result json;
BEGIN
  if userid is not null then
  
    -- replace the provider for this user completely
    delete from logins where 
      logins.user_id = userid AND 
      logins.provider = new_provider;

    -- add the login
    insert into logins(user_id, provider_key, provider_token, provider)
    values (userid, key, token, new_provider);

    -- add log entry
    -- insert into logs(subject, entry, user_id, created_at)
    -- values('Authentication','Added ' || new_provider || ' login',userid,now());

    success := true;
    message :=  'Added login successfully';
  end if;

  return query
  select message, success;

END;
$$
language plpgsql;


CREATE or REPLACE FUNCTION authenticate(
  -- Three modes authentication      mode1    / mode2   / mode3
  un VARCHAR,               -- username / 'token' / 'token'
  pwd VARCHAR,               -- password / token   / token 
  prov VARCHAR DEFAULT 'local',   -- 'local'  / 'token' / 'qq'
  oauth_user_id BIGINT DEFAULT NULL -- if provided, use a oauth binding mode
)
RETURNS syncollege_db.login_info AS $$
DECLARE
  oauth_user syncollege_db.oauth2Users;
  found_user syncollege_db.users;
  return_message VARCHAR(50);
  success BOOLEAN := FALSE;
  found_id BIGINT;
BEGIN
  SET search_path=syncollege_db;
  --find the user by token/provider and username

  IF (prov = 'local') THEN
    SELECT locate_user_by_password(un, pwd) INTO found_id;
  ELSE
    SELECT user_id FROM logins WHERE
    provider = prov and
    provider_token = pwd INTO found_id;
  end IF;
  
  IF(found_id IS NOT NULL) THEN
    SELECT * FROM users WHERE users.id = found_id INTO found_user;
    --set a last_login
    UPDATE users SET last_login = now(), login_count=login_count+1
    WHERE users.id = found_id;

    -- binding check
    IF oauth_user_id IS NOT NULL THEN
      -- get the oauth2 user to bind
      SELECT * INTO oauth_user FROM oauth2Users WHERE oauth2Users.id = oauth_user_id;
      IF NOT FOUND THEN
        success := FALSE;
        return_message := 'oauth_user % not found', oauth_user_id;
      ELSE
        UPDATE oauth2Users SET user_id = found_id WHERE oauth2Users.id = oauth_user_id;
        success := TRUE;
      END IF;
      -- bind operation
    ELSE
      success := TRUE;
      return_message := 'Welcome!';
    END IF;
  ELSE
    success := FALSE;
    return_message := 'Invalid login credentials';
  end IF;
  
  return (found_user.id, 
    found_user.username, 
    found_user.nickname,
    found_user.gender, 
    found_user.role,  
    success, 
    return_message)::syncollege_db.login_info;
END;
$$
language plpgsql;

-- authentication in provider callback
CREATE or REPLACE FUNCTION oauth_authenticate(
  input_provider VARCHAR,
  input_provider_id VARCHAR
)

RETURNS syncollege_db.login_info AS $$
DECLARE
  return_message VARCHAR(50);
  success BOOLEAN := FALSE;
  found_user syncollege_db.users;
  found_id BIGINT;
BEGIN
  SET search_path=syncollege_db;
  --find the user by token/provider and un

  SELECT user_id FROM oauth2Users WHERE
  provider = input_provider and
  unique_provider_id = input_provider_id INTO found_id;

  IF(found_id IS NOT NULL) THEN
    SELECT * FROM users WHERE users.id = found_id INTO found_user;
    --set a last_login
    UPDATE users SET last_login = now(), login_count=login_count+1
    WHERE users.id = found_id;

    success := TRUE;
    return_message := 'Welcome!';
  ELSE
    return_message := 'Invalid login credentials';
  end IF;
  
  return (found_user.id, 
    found_user.username, 
    found_user.nickname,
    found_user.gender, 
    found_user.role,  
    success, 
    return_message)::syncollege_db.login_info;
END;
$$
LANGUAGE PLPGSQL;
set search_path = syncollege_db;

create or replace function change_password(username varchar, old_pass varchar, new_pass varchar)
returns users
as $$
DECLARE
  found_id bigint;
BEGIN
  set search_path=syncollege_db;
  --find the user based on username/password
  select locate_user_by_password(username, old_pass) into found_id;
  if found_id is not null then
    --change the password if all is OK
    update logins set provider_token = crypt(new_pass, gen_salt('bf',10))
    where user_id=found_id and provider='local';
  end if;
  select * from users where users.username = username;
END;
$$
language plpgsql;




create or replace function locate_user_by_password(username varchar, pass varchar)
returns bigint
as $$
  set search_path=syncollege_db;
  select user_id from logins where
  provider_key = username and
  provider_token = crypt(pass, provider_token);
$$
language sql;

CREATE OR REPLACE FUNCTION register(
  un VARCHAR, 
  password VARCHAR, 
  oauth_user_id BIGINT DEFAULT NULL)
RETURNS syncollege_db.login_info
as $$
DECLARE
  oauth_user syncollege_db.oauth2Users;
  new_user syncollege_db.users;
  token VARCHAR(64);
  success BOOLEAN DEFAULT FALSE;
  return_message VARCHAR(64);
BEGIN
  SET search_path=syncollege_db;
    
  IF NOT EXISTS (SELECT users.username FROM users WHERE users.username = un)
  THEN
    -- add them, get new id

    INSERT INTO users(username, role)
    VALUES (un, 10) -- normal user role is 10
    RETURNING * INTO new_user;

    -- add login for local
    -- username as provider_key
    INSERT INTO logins(user_id, provider_key, provider_token)
    VALUES(new_user.id, new_user.username, crypt(password, gen_salt('bf', 10)));

    -- binding check
    IF oauth_user_id IS NOT NULL THEN
      -- get the oauth2 user to bind
      SELECT * INTO oauth_user FROM oauth2Users WHERE oauth2Users.id = oauth_user_id;
      IF NOT FOUND THEN
        success := FALSE;
        return_message := 'oauth_user % not found', oauth_user_id;
      ELSE
        UPDATE oauth2Users SET user_id = new_user.id WHERE oauth2Users.id = oauth_user_id;
        success := TRUE;
      END IF;
      -- bind operation
    ELSE
      success := TRUE;
      return_message := 'Welcome!';
    END IF;
      
    success := TRUE;
    return_message := 'Welcome!';
  ELSE
    success := FALSE;
    select 'This username is already registered' INTO return_message;
  END IF;

  -- return the goods
  return (new_user.id, 
    new_user.username, 
    new_user.gender, 
    new_user.nickname, 
    new_user.role, 
    success,
    return_message)::syncollege_db.login_info;
END;
$$
LANGUAGE PLPGSQL;
ALTER TABLE oauth2Users
ADD CONSTRAINT provider_key UNIQUE (provider, unique_provider_id);
ALTER TABLE logins
ADD CONSTRAINT user_logins
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;
ALTER TABLE oauth2Users
ADD CONSTRAINT user_oauth2Users
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;