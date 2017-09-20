const create_file = async ({ uploader_id, filename }, { pgPool }) => {
  const ret = await pgPool.query('select * from syncollege_db.create_file($1, $2)', [uploader_id, filename]);
  return ret.rows[0];
};
const require_file = async ({ file_id }, { pgPool }) => {
  const ret = await pgPool.query('select * from syncollege_db.require_file($1)', [file_id]);
  return ret.rows[0];
};
const require_uploaded_files = async ({ uploader_id }, { pgPool }) => {
  const ret = await pgPool.query('select * from syncollege_db.files where uploader_id = $1 and status=1', [uploader_id]);
  return ret.rows;
};
const update_file_title = async ({ uploader_id, file_id, title }, { pgPool }) => {
  const ret = await pgPool.query('select * from syncollege_db.update_file_title($1, $2, $3)', [uploader_id, file_id, title]);
  return ret.rows[0];
};
const update_file_status = async ({ file_id, etag, mime, size }, { pgPool }) => {
  const ret = await pgPool.query('select * from syncollege_db.update_file_status($1, $2, $3, $4)', [file_id, etag, mime, size]);
  return ret.rows[0];
};
const delete_file = async ({ uploader_id, file_id }, { pgPool }) => {
  const ret = await pgPool.query('select * from syncollege_db.delete_file($1, $2)', [uploader_id, file_id]);
  return ret.rows[0];
};

export default {
  create_file,
  require_file,
  require_uploaded_files,
  update_file_status,
  update_file_title,
  delete_file,
};
