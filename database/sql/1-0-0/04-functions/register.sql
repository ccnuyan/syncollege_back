CREATE OR REPLACE FUNCTION register(
  un VARCHAR, 
  password VARCHAR, 
  oauth_user_id BIGINT DEFAULT NULL)
RETURNS membership.login_info
as $$
DECLARE
  oauth_user membership.oauth2Users;
  new_user membership.users;
  token VARCHAR(64);
  success BOOLEAN DEFAULT FALSE;
  return_message VARCHAR(64);
BEGIN
  SET search_path=membership;
    
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
    return_message)::membership.login_info;
END;
$$
LANGUAGE PLPGSQL;