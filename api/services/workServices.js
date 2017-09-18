const create_work = async ({ creator_id, title, snapshot, content }, { pgPool }) => {
  const ret = await pgPool.query('select * from syncollege_db.create_work($1, $2, $3, $4)', [creator_id, title, snapshot, content]);
  return ret.rows[0];
};
const require_work = async ({ work_id }, { pgPool }) => {
  const ret = await pgPool.query('select * from syncollege_db.works where id = $1', [work_id]);
  if (ret.rows.length === 0) {
    return { success: false };
  }
  return { ...ret.rows[0], success: true };
};
const require_created_work = async ({ creator_id, work_id }, { pgPool }) => {
  const ret = await pgPool.query('select * from syncollege_db.require_work($1, $2)', [creator_id, work_id]);
  return ret.rows[0];
};
const require_created_works = async ({ creator_id }, { pgPool }) => {
  const ret = await pgPool.query('select * from syncollege_db.works where creator_id = $1', [creator_id]);
  return ret.rows;
};
const require_latest_works = async ({ creator_id }, { pgPool }) => {
  const ret = await pgPool.query('select * from syncollege_db.works order by created_at desc limit 12');
  return ret.rows;
};
const require_popular_works = async ({ creator_id }, { pgPool }) => {
  const ret = await pgPool.query('select * from syncollege_db.works order by visits desc limit 12');
  return ret.rows;
};
const update_work = async ({ creator_id, work_id, title, snapshot, content }, { pgPool }) => {
  const ret = await pgPool.query('select * from syncollege_db.update_work($1, $2, $3, $4, $5)', [creator_id, work_id, title, snapshot, content]);
  return ret.rows[0];
};
const delete_work = async ({ creator_id, work_id }, { pgPool }) => {
  const ret = await pgPool.query('select * from syncollege_db.delete_work($1, $2)', [creator_id, work_id]);
  return ret.rows[0];
};

export default {
  create_work,
  require_work,
  require_created_work,
  require_created_works,
  require_latest_works,
  require_popular_works,
  update_work,
  delete_work,
};
