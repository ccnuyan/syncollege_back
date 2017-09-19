import fileServices from '../services/fileServices';
import qiniuBusiness from './qiniuBusiness';

const create_file = async (req, res) => {
  try {
    const ret = await fileServices.create_file({
      uploader_id: req.user.id,
      filename: req.body.filename,
    }, req.context);

    return res.status(201).send(qiniuBusiness.requestUpload(ret.id));
  } catch (err) {
    printError(err, __dirname);
    return res.status(400).send({ success: false });
  }
};

const access_file = async (req, res) => {
  try {
    const ret = await fileServices.require_file({
      file_id: req.query.file_id,
    }, req.context);

    return res.send(qiniuBusiness.getAccessUrl(ret.id));
  } catch (err) {
    printError(err, __dirname);
    return res.status(400).send({ success: false });
  }
};

const require_file = async (req, res) => {
  try {
    const ret = await fileServices.require_file({
      file_id: req.query.file_id,
    }, req.context);

    return res.send(ret);
  } catch (err) {
    printError(err, __dirname);
    return res.status(400).send({ success: false });
  }
};

const require_uploaded_files = async (req, res) => {
  try {
    const ret = await fileServices.require_uploaded_files({
      uploader_id: req.query.uploader_id || req.user.id,
    }, req.context);
    return res.send(ret);
  } catch (err) {
    printError(err, __dirname);
    return res.status(400).send({ success: false });
  }
};

const update_file_title = async (req, res) => {
  const query = {
    title: req.body.title,
  };

  try {
    const ret = await fileServices.update_file_title({
      uploader_id: req.user.id,
      file_id: req.body.file_id,
      ...query,
    }, req.context);
    return res.send(ret);
  } catch (err) {
    printError(err, __dirname);
    return res.status(400).send({ success: false });
  }
};

const update_file_status = async (req, res) => {
  const query = {
    etag: req.body.etag,
    mime: req.body.mime,
    size: req.body.size,
  };
  console.log(req.body);
  try {
    const ret = await fileServices.update_file_status({
      file_id: req.body.id,
      ...query,
    }, req.context);
    return res.send(ret);
  } catch (err) {
    printError(err, __dirname);
    return res.status(400).send({ success: false });
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
    return res.status(400).send({ success: false });
  }
};

export default {
  create_file,
  require_file,
  access_file,
  require_uploaded_files,
  update_file_title,
  update_file_status,
  delete_file,
};
