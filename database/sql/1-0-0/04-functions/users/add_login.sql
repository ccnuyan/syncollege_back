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

