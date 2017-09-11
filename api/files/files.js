import fileServices from '../services/fileServices';
import qiniuBusiness from './qiniuBusiness';

const create_file = async (req, res) => {
  try {
    const ret = await fileServices.create_file({
      uploader_id: req.user.id,
      filename: req.body.filename,
    }, req.context);

    return res.send(qiniuBusiness.requestUpload(ret.id));
  } catch (err) {
    printError(err, __dirname);
    return res.send({ success: false });
  }
};

const require_file = async (req, res) => {
  try {
    const ret = await fileServices.require_file({
      file_id: req.query.file_id,
    }, req.context);

    return res.send(qiniuBusiness.getAccessUrl(ret.id));
  } catch (err) {
    printError(err, __dirname);
    return res.send({ success: false });
  }
};

const require_created_files = async (req, res) => {
  try {
    const ret = await fileServices.require_created_files({
      uploader_id: req.query.uploader_id || req.user.id,
    }, req.context);
    return res.send(ret);
  } catch (err) {
    printError(err, __dirname);
    return res.send({ success: false });
  }
};

const require_latest_files = async (req, res) => {
  try {
    const ret = await fileServices.require_latest_files({}, req.context);
    return res.send(ret);
  } catch (err) {
    printError(err, __dirname);
    return res.send({ success: false });
  }
};

const require_popular_files = async (req, res) => {
  try {
    const ret = await fileServices.require_popular_files({}, req.context);
    return res.send(ret);
  } catch (err) {
    printError(err, __dirname);
    return res.send({ success: false });
  }
};

const update_file = async (req, res) => {
  const query = {};
  if (req.body.title) query.title = req.body.title;
  if (req.body.snapshot) query.snapshot = req.body.snapshot;
  if (req.body.content) query.content = req.body.content;

  try {
    const ret = await fileServices.update_file({
      uploader_id: req.user.id,
      file_id: req.body.file_id,
      ...query,
    }, req.context);
    return res.send(ret);
  } catch (err) {
    printError(err, __dirname);
    return res.send({ success: false });
  }
};

const delete_file = async (req, res) => {
  try {
    const ret = await fileServices.delete_file({
      uploader_id: req.user.id,
      file_id: req.body.file_id,
    }, req.context);
    return res.send(ret);
  } catch (err) {
    printError(err, __dirname);
    return res.send({ success: false });
  }
};

export default {
  create_file,
  require_file,
  require_created_files,
  require_popular_files,
  require_latest_files,
  update_file,
  delete_file,
};
