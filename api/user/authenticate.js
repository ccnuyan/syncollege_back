import userServices from '../services/userServices';

export default async (req, res) => {
  if (req.user && req.user.success) {
    return res.json(req.user);
  }
  try {
    const ret = await userServices.authenticate(req.body, req.context);
    if (ret.success) {
      req.user = ret;
    }
    return res.json(ret);
  } catch (err) {
    printError(err, __dirname);
    return res.send({ success: false });
  }
};
