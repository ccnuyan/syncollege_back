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