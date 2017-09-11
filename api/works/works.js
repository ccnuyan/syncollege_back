import workServices from '../services/workServices';
import workTemplates from './workTemplates';

const create_work = async (req, res) => {
  const work = {
    title: req.body.title || workTemplates.title,
    snapshot: req.body.snapshot || workTemplates.snapshot,
    content: req.body.content || workTemplates.content,
  };

  try {
    const ret = await workServices.create_work({
      creator_id: req.user.id,
      ...work,
    }, req.context);
    return res.status(201).send(ret);
  } catch (err) {
    printError(err, __dirname);
    return res.status(400).send({ success: false });
  }
};

const require_work = async (req, res) => {
  try {
    const ret = await workServices.require_work({
      creator_id: req.user.id,
      work_id: req.query.work_id,
    }, req.context);
    return res.send(ret);
  } catch (err) {
    printError(err, __dirname);
    return res.status(400).send({ success: false });
  }
};

const require_created_works = async (req, res) => {
  try {
    const ret = await workServices.require_created_works({
      creator_id: req.query.creator_id || req.user.id,
    }, req.context);
    return res.send(ret);
  } catch (err) {
    printError(err, __dirname);
    return res.status(400).send({ success: false });
  }
};

const require_latest_works = async (req, res) => {
  try {
    const ret = await workServices.require_latest_works({}, req.context);
    return res.send(ret);
  } catch (err) {
    printError(err, __dirname);
    return res.status(400).send({ success: false });
  }
};

const require_popular_works = async (req, res) => {
  try {
    const ret = await workServices.require_popular_works({}, req.context);
    return res.send(ret);
  } catch (err) {
    printError(err, __dirname);
    return res.status(400).send({ success: false });
  }
};

const update_work = async (req, res) => {
  const query = {};
  if (req.body.title) query.title = req.body.title;
  if (req.body.snapshot) query.snapshot = req.body.snapshot;
  if (req.body.content) query.content = req.body.content;

  try {
    const ret = await workServices.update_work({
      creator_id: req.user.id,
      work_id: req.body.work_id,
      ...query,
    }, req.context);
    return res.send(ret);
  } catch (err) {
    printError(err, __dirname);
    return res.status(400).send({ success: false });
  }
};

const delete_work = async (req, res) => {
  try {
    const ret = await workServices.delete_work({
      creator_id: req.user.id,
      work_id: req.body.work_id,
    }, req.context);
    return res.send(ret);
  } catch (err) {
    printError(err, __dirname);
    return res.status(400).send({ success: false });
  }
};

export default {
  create_work,
  require_work,
  require_created_works,
  require_popular_works,
  require_latest_works,
  update_work,
  delete_work,
};
