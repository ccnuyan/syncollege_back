import qiniu from 'qiniu';
import conf from '../../config';

qiniu.conf.ACCESS_KEY = conf.qiniu.ak;
qiniu.conf.SECRET_KEY = conf.qiniu.sk;
const bucket = conf.qiniu.bucket;

/**
 * this function should be called by qiniu;
 */

const requestUpload = (file_id) => {
    // first create the id
    // http://eslint.org/docs/rules/quotes
  const putPolicy = new qiniu.rs.PutPolicy(`${bucket}:${file_id}`);

  if (conf.qiniu.mode === 'callback') {
    putPolicy.callbackUrl = `${conf.serviceBase}api/qiniu/upload_callback/`;
    putPolicy.callbackBody = 'size=$(fsize)&mime=$(mimeType)&key=$(key)&etag=$(etag)';
  } else {
    putPolicy.returnBody = `{
      "size":$(fsize),"mime":$(mimeType),"key":$(key),"etag":$(etag)
    }`;
  }

  return {
    token: putPolicy.token(),
    key: file_id,
  };
};

const getAccessUrl = (file_id) => {
  const policy = new qiniu.rs.GetPolicy();
  const url = conf.url + file_id;
  const access_url = policy.makeRequest(url);
  return { access_url };
};

export default{
  requestUpload,
  getAccessUrl,
};
