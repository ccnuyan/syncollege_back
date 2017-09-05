CREATE or REPLACE FUNCTION authenticate(
  -- Three modes authentication      mode1    / mode2   / mode3
  un VARCHAR,               -- username / 'token' / 'token'
  pwd VARCHAR,               -- password / token   / token 
  prov VARCHAR DEFAULT 'local',   -- 'local'  / 'token' / 'qq'
  oauth_user_id BIGINT DEFAULT NULL -- if provided, use a oauth binding mode
)
RETURNS membership.login_info AS $$
DECLARE
  oauth_user membership.oauth2Users;
  found_user membership.users;
  return_message VARCHAR(50);
  success BOOLEAN := FALSE;
  found_id BIGINT;
BEGIN
  SET search_path=membership;
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
    return_message)::membership.login_info;
END;
$$
language plpgsql;

-- authentication in provider callback
CREATE or REPLACE FUNCTION oauth_authenticate(
  input_provider VARCHAR,
  input_provider_id VARCHAR
)

RETURNS membership.login_info AS $$
DECLARE
  return_message VARCHAR(50);
  success BOOLEAN := FALSE;
  found_user membership.users;
  found_id BIGINT;
BEGIN
  SET search_path=membership;
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
    return_message)::membership.login_info;
END;
$$
LANGUAGE PLPGSQL;