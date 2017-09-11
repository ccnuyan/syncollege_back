CREATE TYPE crud_file_info AS(
  id BIGINT,
  uploader_id BIGINT,
  uploader_email VARCHAR,
  title VARCHAR,
  filename VARCHAR,
  etag VARCHAR,
  mime VARCHAR,
  size INTEGER,
  uploaded_at TIMESTAMPTZ,
  file_status INT,
  success BOOLEAN,
  message VARCHAR
);

CREATE OR REPLACE FUNCTION generate_file_crud_result(
  file syncollege_db.files,
  success BOOLEAN,
  message VARCHAR)
RETURNS syncollege_db.crud_file_info
as $$
DECLARE
  uploader_email varchar;
BEGIN
  SET search_path=syncollege_db;
  SELECT username FROM users WHERE id = file.uploader_id into uploader_email;
  return (
    file.id,
    file.uploader_id, 
    uploader_email, 
    file.title, 
    file.filename,
    file.etag,
    file.mime,
    file.size,
    file.uploaded_at,
    file.status,
    success, 
    message
  )::syncollege_db.crud_file_info;
END;
$$
LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION create_file(
  uid BIGINT, -- username
  filename VARCHAR(256)) --content
RETURNS syncollege_db.crud_file_info
as $$
DECLARE
  new_file syncollege_db.files;
  success BOOLEAN;
  return_message VARCHAR(64);
BEGIN
  SET search_path=syncollege_db;
    
  IF EXISTS (SELECT users.id FROM users WHERE users.id = uid)
  THEN
    INSERT INTO files(uploader_id, filename)
    VALUES (uid, filename)
    RETURNING * INTO new_file;
    success := TRUE;
    return_message := 'New file created';
  ELSE
    success := FALSE;
    SELECT 'This user does not exist' INTO return_message;
  END IF;
  return syncollege_db.generate_file_crud_result(new_file, success, return_message);
END;
$$
LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION require_file(fid BIGINT)
RETURNS syncollege_db.crud_file_info
as $$
DECLARE
  require_file syncollege_db.files;
  success BOOLEAN;
  return_message VARCHAR(64);
BEGIN
  SET search_path=syncollege_db;

  SELECT * FROM files WHERE id = fid into require_file;

  IF require_file.id IS NOT NULL
  THEN
    success := TRUE;
    return_message := 'Required file found';
  ELSE
    success := FALSE;
    select 'This file does not exist' INTO return_message;
  END IF;
  return syncollege_db.generate_file_crud_result(require_file, success, return_message);
END;
$$
LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION update_file_title(
  uid BIGINT, -- username
  fid BIGINT, -- fileid
  tt VARCHAR(256))
RETURNS syncollege_db.crud_file_info
as $$
DECLARE
  update_file syncollege_db.files;
  success BOOLEAN;
  return_message VARCHAR(64);
BEGIN
  SET search_path=syncollege_db;

  IF EXISTS (SELECT id FROM files WHERE id = fid and uploader_id = uid)
  THEN
    UPDATE files SET title = tt 
    WHERE id = fid;

    SELECT * FROM files WHERE id = fid AND uploader_id = uid INTO update_file;
    success := TRUE;
    return_message := 'File updated';
  ELSE
    success := FALSE;
    select 'The file created by this uploader does not exist' INTO return_message;
  END IF;
  return syncollege_db.generate_file_crud_result(update_file, success, return_message);
END;
$$
LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION update_file_status(
  uid BIGINT, -- username
  fid BIGINT, -- fileid
  et VARCHAR,
  mm VARCHAR,
  sz INTEGER)
RETURNS syncollege_db.crud_file_info
as $$
DECLARE
  update_file syncollege_db.files;
  success BOOLEAN;
  return_message VARCHAR(64);
BEGIN
  SET search_path=syncollege_db;

  IF EXISTS (SELECT id FROM files WHERE id = fid and uploader_id = uid)
  THEN
    UPDATE files SET size=sz, etag=et, mime=mm, uploaded_at=now(), status=1
    WHERE id = fid;

    SELECT * FROM files WHERE id = fid AND uploader_id = uid INTO update_file;
    success := TRUE;
    return_message := 'File updated';
  ELSE
    success := FALSE;
    select 'The file created by this uploader does not exist' INTO return_message;
  END IF;
  return syncollege_db.generate_file_crud_result(update_file, success, return_message);
END;
$$
LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION delete_file(
  uid BIGINT, -- username
  fid BIGINT) -- fileid
RETURNS syncollege_db.crud_file_info
as $$
DECLARE
  deleted_file syncollege_db.files;
  success BOOLEAN;
  return_message VARCHAR(64);
BEGIN
  SET search_path=syncollege_db;

  IF EXISTS (SELECT * FROM files WHERE files.id = fid and files.uploader_id = uid)
  THEN
    DELETE FROM files
    WHERE files.id = fid
    RETURNING * INTO deleted_file;
    success := TRUE;
    return_message := 'File deleted';
  ELSE
    success := FALSE;
    SELECT 'The file created by this uploader does not exist' INTO return_message;
  END IF;

  return syncollege_db.generate_file_crud_result(deleted_file, success, return_message);
END;
$$
LANGUAGE PLPGSQL;